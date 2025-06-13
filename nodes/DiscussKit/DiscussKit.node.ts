import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';
import { v4 as uuidv4 } from 'uuid';

import { labelFields, labelOperations } from './LabelDescription';
import { blockletComponentApiRequest } from '../BlockletComponent/GenericFunctions';
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
				name: 'blockletComponentApi',
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
						name: 'Comment',
						value: 'comment',
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		const qs: IDataObject = {};
		let result;
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

						result = await blockletComponentApiRequest.call(this, 'POST', '/api/boards', body);
					}
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);
						result = await blockletComponentApiRequest.call(this, 'GET', '/api/boards', {}, qs);
						result = result.boards;
						if (!returnAll) {
							const limit = this.getNodeParameter('limit', i);
							result = result.splice(0, limit);
						}
					}
				}
				if (resource === 'label') {
					if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;

						const body: IDataObject = {
							name,
						};

						result = await blockletComponentApiRequest.call(this, 'POST', '/api/labels', {
							group: body,
						});
					}
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);
						result = await blockletComponentApiRequest.call(this, 'GET', '/api/labels', {}, qs);
						result = result.labels;

						if (!returnAll) {
							const limit = this.getNodeParameter('limit', i);
							result = result.splice(0, limit);
						}
					}
				}

				if (['discussion', 'blog', 'bookmark', 'doc'].includes(resource)) {
					if (operation === 'create') {
						let locale = 'en';
						let order = -1;
						let parentId = '';
						let slug = '';

						const boardId = this.getNodeParameter('boardId', i) as string;
						const labels = this.getNodeParameter('labels', i) as string;
						const assignees = this.getNodeParameter('assignees', i) as string;

						const body: IDataObject = {
							type: resource,
						};

						if (resource !== 'bookmark') {
							body.title = this.getNodeParameter('title', i) as string;
							body.content = this.getNodeParameter('content', i) as string;
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

						if (resource === 'blog' || resource === 'doc') {
							locale = this.getNodeParameter('locale', i) as string;
							slug = this.getNodeParameter('slug', i) as string;
							if (locale) {
								body.locale = locale;
							}
							if (slug) {
								body.slug = slug;
							}
						}
						if (resource === 'doc') {
							order = this.getNodeParameter('order', i) as number;
							parentId = this.getNodeParameter('parentId', i) as string;
							if (parentId) {
								body.parentId = parentId;
							}
							if (order) {
								body.order = order;
							}
						}

						if (resource === 'discussion') {
							result = await blockletComponentApiRequest.call(
								this,
								'POST',
								'/api/posts/drafts',
								body,
							);
							result = await blockletComponentApiRequest.call(
								this,
								'POST',
								`/api/posts/${result.id}/publish`,
								body,
							);
						}
						if (resource === 'blog') {
							result = await blockletComponentApiRequest.call(this, 'POST', '/api/blogs', body);
							result = await blockletComponentApiRequest.call(
								this,
								'POST',
								`/api/blogs/${result.id}/publish`,
								body,
							);
							result = await blockletComponentApiRequest.call(
								this,
								'GET',
								`/api/blogs/${result.id}?locale=${locale}`,
							);
						}
						if (resource === 'doc') {
							result = await blockletComponentApiRequest.call(this, 'POST', '/api/docs', body);
							result = await blockletComponentApiRequest.call(
								this,
								'PUT',
								`/api/docs/${result.id}`,
								{
									...result,
									...body,
								},
							);
						}
						if (resource === 'bookmark') {
							const url = this.getNodeParameter('url', i) as string;
							const id = uuidv4();
							const og = await blockletComponentApiRequest.call(
								this,
								'GET',
								'/api/embed/og',
								{},
								{ url, includeRaw: true, timeout: 60000 },
							);
							const payload: IDataObject = {
								content: '',
								object: {
									...body,
									id,
									title: og.title || og['twitter:title'] || og['og:title'] || 'Title',
									excerpt:
										og.description ||
										og['twitter:description'] ||
										og['og:description'] ||
										'Description',
									cover: og.image || og['twitter:image'] || og['og:image'] || '',
									originLink: url,
									type: 'bookmark',
								},
							};

							result = await blockletComponentApiRequest.call(
								this,
								'POST',
								'/api/comments',
								payload,
							);
							result = await blockletComponentApiRequest.call(
								this,
								'GET',
								`/api/bookmarks/${id}`,
								{},
							);
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
							result = await blockletComponentApiRequest.call(
								this,
								'PUT',
								`/api/posts/${id}`,
								body,
							);
						}
						if (resource === 'blog') {
							result = await blockletComponentApiRequest.call(
								this,
								'PUT',
								`/api/blogs/${id}`,
								body,
							);
						}
						if (resource === 'doc') {
							result = await blockletComponentApiRequest.call(this, 'PUT', `/api/docs/${id}`, body);
						}
						if (resource === 'bookmark') {
							// FIXME:
						}
					}

					if (operation === 'settings') {
						const id = this.getNodeParameter('id', i) as string;
						const cover = this.getNodeParameter('cover', i) as string;
						const slug = this.getNodeParameter('slug', i) as string;
						const body: IDataObject = { id };
						if (cover) {
							body.cover = cover;
						}
						if (slug) {
							body.slug = slug;
						}
						if (resource === 'discussion') {
							result = await blockletComponentApiRequest.call(
								this,
								'PUT',
								`/api/posts/${id}/settings`,
								body,
							);
						}
						if (resource === 'blog') {
							result = await blockletComponentApiRequest.call(
								this,
								'PUT',
								`/api/blogs/${id}/settings`,
								body,
							);
						}
						if (resource === 'doc') {
							result = await blockletComponentApiRequest.call(
								this,
								'PUT',
								`/api/docs/${id}/settings`,
								body,
							);
						}
						if (resource === 'bookmark') {
							// FIXME:
						}
					}

					if (operation === 'addLabel') {
						const id = this.getNodeParameter('id', i) as string;
						const label = this.getNodeParameter('label', i) as string;
						await blockletComponentApiRequest.call(this, 'POST', `/api/posts/${id}/labels`, {
							label,
						});
					}

					if (operation === 'removeLabel') {
						const id = this.getNodeParameter('id', i) as string;
						const label = this.getNodeParameter('label', i) as string;
						await blockletComponentApiRequest.call(
							this,
							'DELETE',
							`/api/posts/${id}/labels/${label}`,
						);
					}

					if (operation === 'addAssignee') {
						const id = this.getNodeParameter('id', i) as string;
						const assignee = this.getNodeParameter('assignee', i) as string;
						await blockletComponentApiRequest.call(this, 'POST', `/api/posts/${id}/assignees`, {
							assignee,
						});
					}

					if (operation === 'removeAssignee') {
						const id = this.getNodeParameter('id', i) as string;
						const assignee = this.getNodeParameter('assignee', i) as string;
						await blockletComponentApiRequest.call(
							this,
							'DELETE',
							`/api/posts/${id}/assignees/${assignee}`,
						);
					}

					if (operation === 'publish') {
						const id = this.getNodeParameter('id', i) as string;
						if (resource === 'discussion') {
							result = await blockletComponentApiRequest.call(
								this,
								'POST',
								`/api/posts/${id}/publish`,
								{},
							);
						}
						if (resource === 'blog') {
							result = await blockletComponentApiRequest.call(
								this,
								'POST',
								`/api/blogs/${id}/publish`,
								{},
							);
						}
					}

					if (operation === 'delete') {
						const id = this.getNodeParameter('id', i) as string;
						result = await blockletComponentApiRequest.call(
							this,
							'DELETE',
							`/api/${resource}s/${id}`,
							{},
						);
					}

					if (operation === 'get') {
						const id = this.getNodeParameter('id', i) as string;
						result = await blockletComponentApiRequest.call(
							this,
							'GET',
							`/api/${resource}s/${id}`,
							{},
							qs,
						);
					}

					if (operation === 'list') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const limit = this.getNodeParameter('limit', i, 0);
						const boardId = this.getNodeParameter('boardId', i) as string;
						if (boardId) {
							qs.boardId = boardId;
						}

						result = await blockletComponentApiRequest.call(
							this,
							'GET',
							`/api/${resource}s`,
							{},
							qs,
						);
						result = Array.isArray(result) ? result : result.data;

						let lastPost = result.pop();
						if (lastPost) {
							let previousId;
							while (lastPost.id !== previousId) {
								if (limit && result.length > limit) {
									break;
								}
								const chunk = await blockletComponentApiRequest.call(
									this,
									'GET',
									`/api/${resource}s`,
									{},
									qs,
								);
								result = result.concat(Array.isArray(chunk) ? chunk : chunk.data);
								previousId = lastPost.id;
								lastPost = result.pop();
							}
							result.push(lastPost);
						}
						if (!returnAll) {
							result = result.splice(0, limit);
						}
					}
				}

				if (resource === 'comment') {
					if (operation === 'create') {
						const objectId = this.getNodeParameter('objectId', i) as string;
						const content = this.getNodeParameter('content', i) as string;
						const body: IDataObject = { content, object: { id: objectId } };
						result = await blockletComponentApiRequest.call(this, 'POST', `/api/comments`, body);
					}
					if (operation === 'update') {
						const commentId = this.getNodeParameter('commentId', i) as string;
						const content = this.getNodeParameter('content', i) as string;
						const body: IDataObject = { content, updatedAt: new Date().toISOString() };
						result = await blockletComponentApiRequest.call(
							this,
							'PUT',
							`/api/comments/${commentId}`,
							body,
						);
					}
					if (operation === 'delete') {
						const commentId = this.getNodeParameter('commentId', i) as string;
						result = await blockletComponentApiRequest.call(
							this,
							'DELETE',
							`/api/comments/${commentId}`,
						);
					}
					if (operation === 'pin') {
						const commentId = this.getNodeParameter('commentId', i) as string;
						result = await blockletComponentApiRequest.call(
							this,
							'PUT',
							`/api/posts/${commentId}/pinned`,
						);
					}
					if (operation === 'list') {
						const objectId = this.getNodeParameter('objectId', i) as string;
						const limit = this.getNodeParameter('limit', i, 50);
						const qs: IDataObject = {
							objectId,
							includeReplies: 1,
							initialRepliesLimit: -1,
							order: 'desc',
							embed: 'replies,rating',
              limit,
							size: limit,
						};
						result = await blockletComponentApiRequest.call(this, 'GET', `/api/comments`, {}, qs);
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

						result = await blockletComponentApiRequest.call(this, 'GET', '/api/search', {}, qs);
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(result as IDataObject[]),
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
