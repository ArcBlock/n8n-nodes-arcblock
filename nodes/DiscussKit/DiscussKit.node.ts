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
import { contentFields, contentOperations } from './ContentDescription';
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
			...contentOperations,
			...contentFields,
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

				if (['discussion', 'blog', 'bookmark', 'doc'].includes(resource)) {
					if (operation === 'create') {
						const title = this.getNodeParameter('title', i) as string;
						const content = this.getNodeParameter('content', i) as string;
						const boardId = this.getNodeParameter('boardId', i) as string;
						const labels = this.getNodeParameter('labels', i) as string;
						const assignees = this.getNodeParameter('assignees', i) as string;
						const locale = this.getNodeParameter('locale', i) as string;
						const slug = this.getNodeParameter('slug', i) as string;

						const body: IDataObject = {
							type: resource,
							title,
							content,
						};

						if (locale) {
							body.locale = locale;
						}
						if (slug) {
							body.slug = slug;
						}
						if (boardId) {
							body.boardId = boardId;
						} else {
							body.boardId = `${resource}-default`;
						}
						if (labels) {
							body.labels = labels.split(',');
						}
						if (assignees) {
							body.assignees = assignees.split(',');
						}

						if (resource === 'discussion') {
							responseData = await discussKitApiRequest.call(this, 'POST', '/api/posts/drafts', body);
							responseData = await discussKitApiRequest.call(this, 'POST', `/api/posts/${responseData.id}/publish`, body);
						}
						if (resource === 'blog') {
							responseData = await discussKitApiRequest.call(this, 'POST', '/api/blogs', body);
							responseData = await discussKitApiRequest.call(this, 'POST', `/api/blogs/${responseData.id}/publish`, body);
							responseData = await discussKitApiRequest.call(this, 'GET', `/api/blogs/${responseData.id}?locale=${locale}`);
						}
						if (resource === 'doc') {
							responseData = await discussKitApiRequest.call(this, 'POST', '/api/docs', body);
						}
						if (resource === 'bookmark') {
							// FIXME:
						}
					}

					if (operation === 'update') {
						const id = this.getNodeParameter('id', i) as string;
						const title = this.getNodeParameter('title', i) as string;
						const content = this.getNodeParameter('content', i) as string;
						const boardId = this.getNodeParameter('boardId', i) as string;
						const labels = this.getNodeParameter('labels', i) as string;
						const assignees = this.getNodeParameter('assignees', i) as string;

						const body: IDataObject = {};
						if (title) {
							body.title = title;
						}
						if (content) {
							body.content = content;
						}
						if (boardId) {
							body.boardId = boardId;
						}
						if (labels) {
							body.labels = labels.split(',');
						}
						if (assignees) {
							body.assignees = assignees.split(',');
						}
						if (resource === 'discussion') {
							responseData = await discussKitApiRequest.call(this, 'PUT', `/api/posts/${id}`, body);
						}
						if (resource === 'blog') {
							responseData = await discussKitApiRequest.call(this, 'PUT', `/api/blogs/${id}`, body);
						}
						if (resource === 'doc') {
							responseData = await discussKitApiRequest.call(this, 'PUT', `/api/docs/${id}`, body);
						}
						if (resource === 'bookmark') {
							// FIXME:
						}
					}

					if (operation === 'publish') {
						const id = this.getNodeParameter('id', i) as string;
						if (resource === 'discussion') {
							responseData = await discussKitApiRequest.call(this, 'POST', `/api/posts/${id}/publish`, {});
						}
						if (resource === 'blog') {
							responseData = await discussKitApiRequest.call(this, 'POST', `/api/blogs/${id}/publish`, {});
						}
					}

					if (operation === 'delete') {
						const id = this.getNodeParameter('id', i) as string;
						responseData = await discussKitApiRequest.call(this, 'DELETE', `/api/${resource}s/${id}`, {});
					}

					if (operation === 'get') {
						const id = this.getNodeParameter('id', i) as string;
						responseData = await discussKitApiRequest.call(
							this,
							'GET',
							`/api/${resource}s/${id}`,
							{},
							qs,
						);
					}
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const limit = this.getNodeParameter('limit', i, 0);

						responseData = await discussKitApiRequest.call(this, 'GET', `/api/${resource}s`, {}, qs);
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
								`/api/${resource}s`,
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
						const id = this.getNodeParameter('id', i) as string;
						const content = this.getNodeParameter('content', i) as string;

						const body: IDataObject = {
							content,
						};

						responseData = await discussKitApiRequest.call(
							this,
							'PUT',
							`/api/${resource}s/${id}`,
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

						responseData = await discussKitApiRequest.call(this, 'GET', '/api/search', {}, qs);
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
