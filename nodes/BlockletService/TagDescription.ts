import type { INodeProperties } from 'n8n-workflow';

export const tagOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		description: 'Choose an operation',
		required: true,
		displayOptions: {
			show: {
				resource: ['tag'],
			},
		},
		options: [
			{
				name: 'Create Tag',
				value: 'createTag',
				description: 'Create a tag',
				action: 'Create a tag',
			},
			{
				name: 'Get Tags',
				value: 'getTags',
				description: 'Get many tags',
				action: 'Get many tags',
			},
			{
				name: 'Update Tag',
				value: 'updateTag',
				description: 'Update a tag',
				action: 'Update a tag',
			},
			{
				name: 'Delete Tag',
				value: 'deleteTag',
				description: 'Delete a tag',
				action: 'Delete a tag',
			},
		],
		default: 'createTag',
	},
];

export const tagFields: INodeProperties[] = [
	{
		displayName: 'ID',
		name: 'id',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['updateTag', 'deleteTag'],
			},
		},
		default: '',
		description: 'ID of the tag (optional, usually auto-generated)',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['createTag', 'updateTag'],
			},
		},
		default: '',
		description: 'Title of the tag',
	},
	{
		displayName: 'Color',
		name: 'color',
		type: 'color',
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['createTag', 'updateTag'],
			},
		},
		default: '#4B5563',
		description: 'Color of the tag',
	},
	{
		displayName: 'Description',
		name: 'desc',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['createTag', 'updateTag'],
			},
		},
		default: '',
		description: 'Description of the tag',
	},
	{
		displayName: 'Paging',
		name: 'paging',
		type: 'collection',
		placeholder: 'Add Paging',
		default: {},
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['getTags'],
			},
		},
		options: [
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				description: 'The page number to fetch',
			},
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'number',
				default: 20,
				description: 'The number of items per page',
			},
		],
	},
];
