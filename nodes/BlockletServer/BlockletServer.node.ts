import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	ApplicationError,
} from 'n8n-workflow';

import omitBy from 'lodash/omitBy';
import isEmpty from 'lodash/isEmpty';

import { blockletServerApiRequest } from './GenericFunctions';
import { tagFields, tagOperations } from './TagDescription';
import { userFields, userOperations } from './UserDescription';
import { blockletFields, blockletOperations } from './BlockletDescription';

export class BlockletServer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Blocklet Server',
		name: 'blockletServer',
		icon: 'file:blocklet-server.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Blocklet Server API',
		defaults: {
			name: 'Blocklet Server',
		},
		usableAsTool: true,
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'blockletServerApi',
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
				default: 'blocklet',
			},
			...tagOperations,
			...tagFields,
			...userOperations,
			...userFields,
			...blockletOperations,
			...blockletFields,
		],
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
							const teamDid = this.getNodeParameter('teamDid', i) as string;
							result = await blockletServerApiRequest.call(this, 'getOwner', { teamDid });
							break;
						case 'getUser': {
							const teamDid = this.getNodeParameter('teamDid', i) as string;
							const did = this.getNodeParameter('did', i) as string;
							const enabledConnectedAccount = this.getNodeParameter(
								'enabledConnectedAccount',
								i,
							) as boolean;
							const includeTags = this.getNodeParameter('includeTags', i) as boolean;
							result = await blockletServerApiRequest.call(this, 'getUser', {
								teamDid,
								user: { did },
								options: {
									enabledConnectedAccount,
									includeTags,
								},
							});
							break;
						}
						case 'getUsers': {
							const teamDid = this.getNodeParameter('teamDid', i) as string;
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

							result = await blockletServerApiRequest.call(
								this,
								'getUsers',
								omitBy({ teamDid, dids, query, paging, sort }, isEmpty),
							);
							break;
						}
						case 'removeUser': {
							const teamDid = this.getNodeParameter('teamDid', i) as string;
							const did = this.getNodeParameter('did', i) as string;
							result = await blockletServerApiRequest.call(this, 'removeUser', {
								teamDid,
								user: { did },
							});
							break;
						}
						case 'updateUserApproval': {
							const teamDid = this.getNodeParameter('teamDid', i) as string;
							const did = this.getNodeParameter('did', i) as string;
							const approved = this.getNodeParameter('approved', i) as boolean;
							result = await blockletServerApiRequest.call(this, 'updateUserApproval', {
								teamDid,
								user: {
									did,
									approved,
								},
							});
							break;
						}
						case 'updateUserTags': {
							const teamDid = this.getNodeParameter('teamDid', i) as string;
							const did = this.getNodeParameter('did', i) as string;
							const tags = this.getNodeParameter('tags', i) as string[];
							result = await blockletServerApiRequest.call(this, 'updateUserTags', {
								teamDid,
								user: { did },
								tags,
							});
							break;
						}
						default:
							throw new ApplicationError(`Not implemented user action: ${operation}`);
					}
				}

				if (resource === 'tag') {
					switch (operation) {
						case 'createTag': {
							const teamDid = this.getNodeParameter('teamDid', i) as string;
							const title = this.getNodeParameter('title', i) as string;
							const description = this.getNodeParameter('description', i) as string;
							const color = this.getNodeParameter('color', i) as string;
							result = await blockletServerApiRequest.call(this, 'createTag', {
								teamDid,
								tag: { title, description, color },
							});
							break;
						}
						case 'updateTag': {
							const teamDid = this.getNodeParameter('teamDid', i) as string;
							const id = this.getNodeParameter('id', i) as string;
							const title = this.getNodeParameter('title', i) as string;
							const description = this.getNodeParameter('description', i) as string;
							const color = this.getNodeParameter('color', i) as string;
							result = await blockletServerApiRequest.call(this, 'updateTag', {
								teamDid,
								tag: { id, title, description, color },
							});
							break;
						}
						case 'deleteTag': {
							const teamDid = this.getNodeParameter('teamDid', i) as string;
							const id = this.getNodeParameter('id', i) as string;
							result = await blockletServerApiRequest.call(this, 'deleteTag', {
								teamDid,
								tag: { id },
							});
							break;
						}
						case 'getTags': {
							const teamDid = this.getNodeParameter('teamDid', i) as string;
							const paging = this.getNodeParameter('paging', i) as IDataObject;
							result = await blockletServerApiRequest.call(this, 'getTags', {
								teamDid,
								paging,
							});
							break;
						}
						default:
							throw new ApplicationError(`Not implemented tag action: ${operation}`);
					}
				}

				if (resource === 'blocklet') {
					switch (operation) {
						case 'getBlocklet': {
							const did = this.getNodeParameter('did', i) as string;
							result = await blockletServerApiRequest.call(this, 'getBlocklet', {
								did,
							});
							break;
						}
						case 'getBlocklets': {
							result = await blockletServerApiRequest.call(this, 'getBlocklets', {
								includeRuntimeInfo: false,
							});
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
