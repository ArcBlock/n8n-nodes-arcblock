import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { blockletServiceApiRequest } from './GenericFunctions';
import { tagFields, tagOperations } from './TagDescription';
import { userFields, userOperations } from './UserDescription';

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
					if (operation === 'getOwner') {
						result = await blockletServiceApiRequest.call(this, 'getOwner', {});
					}
					if (operation === 'getUser') {
						const did = this.getNodeParameter('did', i) as string;
						const enabledConnectedAccount = this.getNodeParameter('enabledConnectedAccount', i) as boolean;
						const includeTags = this.getNodeParameter('includeTags', i) as boolean;
						result = await blockletServiceApiRequest.call(this, 'getUser', { did, enabledConnectedAccount, includeTags });
					}
					if (operation === 'getUsers') {
						const dids = this.getNodeParameter('dids', i) as string[];
						const includeTags = this.getNodeParameter('includeTags', i) as boolean;
						const includePassports = this.getNodeParameter('includePassports', i) as boolean;
						const includeConnectedAccounts = this.getNodeParameter('includeConnectedAccounts', i) as boolean;
						const role = this.getNodeParameter('role', i) as string;
						const search = this.getNodeParameter('search', i) as string;
						const tags = this.getNodeParameter('tags', i) as string[];
						const paging = this.getNodeParameter('paging', i) as IDataObject;
						const sort = this.getNodeParameter('sort', i) as IDataObject;

						result = await blockletServiceApiRequest.call(this, 'getUsers', { dids, query: { includePassports, includeConnectedAccounts, includeTags, role, search, tags }, paging, sort });
					}
					if (operation === 'updateUserApproval') {
						const did = this.getNodeParameter('did', i) as string;
						const approved = this.getNodeParameter('approved', i) as boolean;
						result = await blockletServiceApiRequest.call(this, 'updateUserApproval', { did, approved });
					}

					// FIXME:
					if (operation === 'login') {
						const did = this.getNodeParameter('did', i) as string;
						result = await blockletServiceApiRequest.call(this, 'login', { did });
					}
					// FIXME:
					if (operation === 'updateUserTag') {
						const did = this.getNodeParameter('did', i) as string;
						const tags = this.getNodeParameter('tags', i) as string[];
						result = await blockletServiceApiRequest.call(this, 'updateUserTag', { did, tags });
					}
				}

				if (resource === 'tag') {
					if (operation === 'create') {
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
