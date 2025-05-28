import type { INodeProperties } from 'n8n-workflow';

export const blockletOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		description: 'Choose an operation',
		required: true,
		displayOptions: {
			show: {
				resource: ['blocklet'],
			},
		},
		options: [
			{
				name: 'Get Blocklet',
				value: 'getBlocklet',
				description: 'Get the blocklet',
				action: 'Get the blocklet',
			},
		],
		default: 'getBlocklet',
	},
];

export const blockletFields: INodeProperties[] = [
	{
		displayName: 'Attach Runtime Info',
		name: 'attachRuntimeInfo',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['blocklet'],
				operation: ['getBlocklet'],
			},
		},
		default: false,
		description: 'Whether to attach the runtime info of the blocklet',
	},
	{
		displayName: 'Attach Disk Info',
		name: 'attachDiskInfo',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['blocklet'],
				operation: ['getBlocklet'],
			},
		},
		default: false,
		description: 'Whether to attach the disk info of the blocklet',
	},
	{
		displayName: 'Get Optional Components',
		name: 'getOptionalComponents',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['blocklet'],
				operation: ['getBlocklet'],
			},
		},
		default: false,
		description: 'Whether to get the optional components of the blocklet',
	},
];
