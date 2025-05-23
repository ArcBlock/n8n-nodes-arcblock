import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import * as uuid from 'uuid';

export class RandomId implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Random ID',
		name: 'randomId',
		icon: 'file:randomid.svg',
		group: ['utility'],
		version: 1,
		description: 'Generate a random ID with UUID',
		defaults: {
			name: 'Random ID',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Version',
				name: 'version',
				type: 'number',
				default: 4,
				required: true,
				placeholder: 'Version',
				description: 'Version of the ID',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				item = items[itemIndex];
				const version = this.getNodeParameter('version', itemIndex, 4) as number;
				if ([1, 3, 4, 5, 6, 7].includes(version)) {
					// @ts-ignore
					item.json.uuid = uuid[`v${version}`]();
				} else {
					throw new NodeOperationError(this.getNode(), new Error('Invalid version'), { itemIndex, });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, { itemIndex, });
				}
			}
		}

		return [items];
	}
}
