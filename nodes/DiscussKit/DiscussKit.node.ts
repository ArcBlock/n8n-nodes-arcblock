import {
	IExecuteFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { labelFields, labelOperations } from './LabelDescription';
import { discussKitApiRequest } from './GenericFunctions';
import { boardFields, boardOperations } from './BoardDescription';
import { discussionFields, discussionOperations } from './DiscussionDescription';
import { searchFields, searchOperations } from './SearchDescription';

export class DiscussKit implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Discuss Kit',
		name: 'discussKit',
		icon: 'file:discusskit.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Discuss Kit API',
		defaults: {
			name: 'Discuss Kit',
		},
		usableAsTool: true,
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'discussKitApi',
				required: false,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Blog',
						value: 'blog',
					},
					{
						name: 'Board',
						value: 'board',
					},
					{
						name: 'Bookmark',
						value: 'bookmark',
					},
					{
						name: 'Discussion',
						value: 'discussion',
					},
					{
						name: 'Documentation',
						value: 'doc',
					},
					{
						name: 'Label',
						value: 'label',
					},
					{
						name: 'Search',
						value: 'search',
					},
				],
				default: 'discussion',
			},
			...labelOperations,
			...labelFields,
			...boardOperations,
			...boardFields,
			...discussionOperations,
			...discussionFields,
			...searchOperations,
			...searchFields,
		],
	};

	methods = {
		loadOptions: {
			// Get all the calendars to display them to user so that they can
			// select them easily
			async getCategories(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const { category_list } = await discussKitApiRequest.call(this, 'GET', '/categories.json');
				for (const category of category_list.categories) {
					returnData.push({
						name: category.name,
						value: category.id,
					});
				}
				return returnData;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		const qs: IDataObject = {};
		let responseData;
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);
		for (let i = 0; i < length; i++) {
			try {
				if (resource === 'board') {
					if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const color = this.getNodeParameter('color', i) as string;
						const textColor = this.getNodeParameter('textColor', i) as string;

						const body: IDataObject = {
							name,
							color,
							text_color: textColor,
						};

						responseData = await discussKitApiRequest.call(this, 'POST', '/api/boards', body);
					}
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);

						responseData = await discussKitApiRequest.call(this, 'GET', '/api/boards', {}, qs);

						responseData = responseData.boards;

						if (!returnAll) {
							const limit = this.getNodeParameter('limit', i);
							responseData = responseData.splice(0, limit);
						}
					}
				}
				if (resource === 'label') {
					if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;

						const body: IDataObject = {
							name,
						};

						responseData = await discussKitApiRequest.call(this, 'POST', '/api/labels', {
							group: body,
						});
					}
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);

						responseData = await discussKitApiRequest.call(this, 'GET', '/api/labels', {}, qs);

						responseData = responseData.labels;

						if (!returnAll) {
							const limit = this.getNodeParameter('limit', i);
							responseData = responseData.splice(0, limit);
						}
					}
				}
				if (resource === 'post') {
					if (operation === 'create') {
						const content = this.getNodeParameter('content', i) as string;
						const title = this.getNodeParameter('title', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i);

						const body: IDataObject = {
							title,
							raw: content,
						};

						Object.assign(body, additionalFields);

						responseData = await discussKitApiRequest.call(this, 'POST', '/posts.json', body);
					}
					if (operation === 'get') {
						const postId = this.getNodeParameter('postId', i) as string;

						responseData = await discussKitApiRequest.call(this, 'GET', `/posts/${postId}`, {}, qs);
					}
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const limit = this.getNodeParameter('limit', i, 0);

						responseData = await discussKitApiRequest.call(this, 'GET', '/posts.json', {}, qs);
						responseData = responseData.latest_posts;

						//Getting all posts relying on https://github.com/discourse/discourse_api/blob/main/spec/discourse_api/api/posts_spec.rb
						let lastPost = responseData.pop();
						let previousLastPostID;
						while (lastPost.id !== previousLastPostID) {
							if (limit && responseData.length > limit) {
								break;
							}
							const chunk = await discussKitApiRequest.call(
								this,
								'GET',
								`/posts.json?before=${lastPost.id}`,
								{},
								qs,
							);
							responseData = responseData.concat(chunk.latest_posts);
							previousLastPostID = lastPost.id;
							lastPost = responseData.pop();
						}
						responseData.push(lastPost);

						if (!returnAll) {
							responseData = responseData.splice(0, limit);
						}
					}
					if (operation === 'update') {
						const postId = this.getNodeParameter('postId', i) as string;

						const content = this.getNodeParameter('content', i) as string;

						const updateFields = this.getNodeParameter('updateFields', i);

						const body: IDataObject = {
							raw: content,
						};

						Object.assign(body, updateFields);

						responseData = await discussKitApiRequest.call(
							this,
							'PUT',
							`/posts/${postId}.json`,
							body,
						);

						responseData = responseData.post;
					}
				}
				if (resource === 'search') {
					if (operation === 'query') {
						qs.q = this.getNodeParameter('q', i) as string;
						qs.type = this.getNodeParameter('type', i) as string;
						qs.isHybrid = this.getNodeParameter('isHybrid', i) as boolean;
						qs.isExact = this.getNodeParameter('isExact', i) as boolean;
						qs.isMatchAny = this.getNodeParameter('isMatchAny', i) as boolean;
						qs.isInclude = this.getNodeParameter('isInclude', i) as boolean;
						qs.withComments = this.getNodeParameter('withComments', i) as boolean;
						qs.sort = this.getNodeParameter('sort', i) as string;
						qs.offset = this.getNodeParameter('offset', i) as number;
						qs.limit = this.getNodeParameter('limit', i) as number;

						responseData = await discussKitApiRequest.call(
							this,
							'GET',
							'/api/search',
							{},
							qs,
						);
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject[]),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error.message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}
		return [returnData];
	}
}
