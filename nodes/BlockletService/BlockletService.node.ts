import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	ApplicationError,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

import omitBy from 'lodash/omitBy';
import isEmpty from 'lodash/isEmpty';

import { blockletServiceApiRequest } from './GenericFunctions';
import { tagFields, tagOperations } from './TagDescription';
import { userFields, userOperations } from './UserDescription';
import { blockletFields, blockletOperations } from './BlockletDescription';

export class BlockletService implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Blocklet Service',
		name: 'blockletService',
		icon: 'file:blocklet-service.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Blocklet Service API',
		defaults: {
			name: 'Blocklet Service',
		},
		usableAsTool: true,
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'blockletServiceApi',
				required: true,
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
						name: 'Blocklet',
						value: 'blocklet',
					},
					{
						name: 'Passport',
						value: 'passport',
					},
					{
						name: 'Tag',
						value: 'tag',
					},
					{
						name: 'User',
						value: 'user',
					},
				],
				default: 'user',
			},
			...tagOperations,
			...tagFields,
			...userOperations,
			...userFields,
			...blockletOperations,
			...blockletFields,
		],
	};

	methods = {
		loadOptions: {
			async getTags(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const result: INodePropertyOptions[] = [];
				const { tags } = await blockletServiceApiRequest.call(this, 'getTags', {
					paging: { pageSize: 100 },
				});
				for (const tag of tags) {
					result.push({
						name: tag.title,
						value: tag.id,
					});
				}
				return result;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		let result;
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);
		for (let i = 0; i < length; i++) {
			try {
				if (resource === 'user') {
					switch (operation) {
						case 'getOwner':
							result = await blockletServiceApiRequest.call(this, 'getOwner', {});
							break;
						case 'getUser': {
							const did = this.getNodeParameter('did', i) as string;
							const enabledConnectedAccount = this.getNodeParameter(
								'enabledConnectedAccount',
								i,
							) as boolean;
							const includeTags = this.getNodeParameter('includeTags', i) as boolean;
							result = await blockletServiceApiRequest.call(this, 'getUser', {
								did,
								enabledConnectedAccount,
								includeTags,
							});
							break;
						}
						case 'getUsers': {
							const dids = this.getNodeParameter('dids', i) as string[];
							const includeTags = this.getNodeParameter('includeTags', i) as boolean;
							const includePassports = this.getNodeParameter('includePassports', i) as boolean;
							const includeConnectedAccounts = this.getNodeParameter(
								'includeConnectedAccounts',
								i,
							) as boolean;
							const role = this.getNodeParameter('role', i) as string;
							const search = this.getNodeParameter('search', i) as string;
							const tags = this.getNodeParameter('tags', i) as string[];
							const paging = Object.assign(
								{ pageSize: 50 },
								this.getNodeParameter('paging', i) as IDataObject,
							);
							const sort = Object.assign(
								{ createdAt: 0 },
								this.getNodeParameter('sort', i) as IDataObject,
							);

							const query: IDataObject = {};
							if (includePassports) {
								query.includePassports = true;
							}
							if (includeConnectedAccounts) {
								query.includeConnectedAccounts = true;
							}
							if (includeTags) {
								query.includeTags = true;
							}
							if (role) {
								query.role = role;
							}
							if (search) {
								query.search = search;
							}
							if (tags && tags.length > 0) {
								query.tags = tags;
							}

							result = await blockletServiceApiRequest.call(
								this,
								'getUsers',
								omitBy({ dids, query, paging, sort }, isEmpty),
							);
							break;
						}
						case 'updateUserApproval': {
							const did = this.getNodeParameter('did', i) as string;
							const approved = this.getNodeParameter('approved', i) as boolean;
							result = await blockletServiceApiRequest.call(this, 'updateUserApproval', {
								did,
								approved,
							});
							break;
						}
						// FIXME:
						case 'login': {
							const did = this.getNodeParameter('did', i) as string;
							result = await blockletServiceApiRequest.call(this, 'login', { did });
							break;
						}
						case 'updateUserTags': {
							const did = this.getNodeParameter('did', i) as string;
							const tags = this.getNodeParameter('tags', i) as string[];
							result = await blockletServiceApiRequest.call(this, 'updateUserTags', { did, tags });
							break;
						}
						default:
							throw new ApplicationError(`Not implemented user action: ${operation}`);
					}
				}

				if (resource === 'tag') {
					switch (operation) {
						case 'createTag': {
							const title = this.getNodeParameter('title', i) as string;
							const description = this.getNodeParameter('description', i) as string;
							const color = this.getNodeParameter('color', i) as string;
							result = await blockletServiceApiRequest.call(this, 'createTag', {
								tag: { title, description, color },
							});
							break;
						}
						case 'updateTag': {
							const id = this.getNodeParameter('id', i) as string;
							const title = this.getNodeParameter('title', i) as string;
							const description = this.getNodeParameter('description', i) as string;
							const color = this.getNodeParameter('color', i) as string;
							result = await blockletServiceApiRequest.call(this, 'updateTag', {
								tag: { id, title, description, color },
							});
							break;
						}
						case 'deleteTag': {
							const id = this.getNodeParameter('id', i) as string;
							result = await blockletServiceApiRequest.call(this, 'deleteTag', { tag: { id } });
							break;
						}
						case 'getTags': {
							const paging = this.getNodeParameter('paging', i) as IDataObject;
							result = await blockletServiceApiRequest.call(this, 'getTags', { paging });
							break;
						}
						default:
							throw new ApplicationError(`Not implemented tag action: ${operation}`);
					}
				}

				if (resource === 'blocklet') {
					switch (operation) {
						case 'getBlocklet': {
							result = await blockletServiceApiRequest.call(this, 'getBlocklet', {});
							break;
						}
						default:
							throw new ApplicationError(`Not implemented blocklet action: ${operation}`);
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
