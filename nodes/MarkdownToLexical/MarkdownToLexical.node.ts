import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { markdownToLexical } from './utils';

export class MarkdownToLexical implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Markdown to Lexical',
		name: 'markdownToLexical',
		icon: 'file:lexical.svg',
		group: ['transform'],
		version: 1,
		description: 'Transform Markdown to JSON for Lexical',
		defaults: {
			name: 'Markdown to Lexical',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Markdown',
				name: 'markdown',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'Markdown content',
				description: 'Markdown content to transform to JSON for Lexical',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		let markdown: string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				item = items[itemIndex];
				markdown = this.getNodeParameter('markdown', itemIndex, '') as string;
				if (markdown) {
					item.json.lexicalJson = JSON.stringify(await markdownToLexical(markdown));
				} else {
					item.json.lexicalJson = '';
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
