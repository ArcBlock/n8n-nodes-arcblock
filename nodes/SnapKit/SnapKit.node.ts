import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { blockletComponentApiRequest } from '../BlockletComponent/GenericFunctions';

export class SnapKit implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SnapKit',
		name: 'snapKit',
		icon: 'file:snap-kit.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume SnapKit API',
		defaults: {
			name: 'Snap Kit',
		},
		usableAsTool: true,
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'blockletComponentApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Snap API',
				name: 'snapApi',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Take Snapshot',
						value: 'takeSnapshot',
					},
					{
						name: 'Crawl Content',
						value: 'crawlContent',
					},
				],
				default: 'takeSnapshot',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				required: true,
				default: '',
				description: 'The URL to capture (must be a valid URI)',
				displayOptions: {
					show: {
						snapApi: ['takeSnapshot', 'crawlContent'],
					},
				},
			},
			{
				displayName: 'Browser Width',
				name: 'width',
				type: 'number',
				default: 1440,
				description: 'Width of the viewport (min: 375px)',
				typeOptions: {
					minValue: 375,
				},
				displayOptions: {
					show: {
						snapApi: ['takeSnapshot'],
					},
				},
			},
			{
				displayName: 'Browser Height',
				name: 'height',
				type: 'number',
				default: 900,
				description: 'Height of the viewport (min: 500px)',
				typeOptions: {
					minValue: 500,
				},
				displayOptions: {
					show: {
						snapApi: ['takeSnapshot'],
					},
				},
			},
			{
				displayName: 'Screenshot Quality',
				name: 'quality',
				type: 'number',
				default: 80,
				description: 'Screenshot quality (1-100)',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				displayOptions: {
					show: {
						snapApi: ['takeSnapshot'],
					},
				},
			},
			{
				displayName: 'Operation Timeout',
				name: 'timeout',
				type: 'number',
				default: 120,
				description: 'Timeout in seconds (10-120)',
				typeOptions: {
					minValue: 10,
					maxValue: 120,
				},
				displayOptions: {
					show: {
						snapApi: ['takeSnapshot', 'crawlContent'],
					},
				},
			},
			{
				displayName: 'Full Page',
				name: 'fullPage',
				type: 'boolean',
				default: false,
				description: 'Whether to capture the full page or just the viewport',
				displayOptions: {
					show: {
						snapApi: ['takeSnapshot'],
					},
				},
			},
			{
				displayName: 'Sync',
				name: 'sync',
				type: 'boolean',
				default: true,
				description: 'Whether to wait for capture completion before responding',
				displayOptions: {
					show: {
						snapApi: ['takeSnapshot', 'crawlContent'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		let result;
		const snapApi = this.getNodeParameter('snapApi', 0);
		for (let i = 0; i < length; i++) {
			try {
				if (snapApi === 'takeSnapshot') {
					const url = this.getNodeParameter('url', i) as string;
					const width = this.getNodeParameter('width', i) as number || 1440;
					const height = this.getNodeParameter('height', i) as number || 900;
					const quality = this.getNodeParameter('quality', i) as number || 80;
					const fullPage = this.getNodeParameter('fullPage', i) as boolean || false;
					const sync = this.getNodeParameter('sync', i) as boolean || true;
					const timeout = this.getNodeParameter('timeout', i) as number || 120;

					result = await blockletComponentApiRequest.call(this, 'POST', '/api/snap', {
						url,
						width,
						height,
						quality,
						fullPage,
						sync,
						timeout,
					});
				}
				if (snapApi === 'crawlContent') {
					const url = this.getNodeParameter('url', i) as string;
					const timeout = this.getNodeParameter('timeout', i) as number || 120;
					const sync = this.getNodeParameter('sync', i) as boolean || true;

					result = await blockletComponentApiRequest.call(this, 'POST', '/api/crawl', {
						url,
						timeout,
						sync,
					});
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
