import type { INodeProperties } from 'n8n-workflow';

export const contentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		description: 'Choose an operation',
		required: true,
		displayOptions: {
			show: {
				resource: ['discussion', 'blog', 'bookmark', 'doc'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create content',
				action: 'Create content',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete content',
				action: 'Delete content',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get content',
				action: 'Get content',
			},
			{
				name: 'Get Many',
				value: 'list',
				description: 'Get many contents',
				action: 'Get many contents',
			},
			{
				name: 'Pin',
				value: 'pin',
				description: 'Pin content',
				action: 'Pin content',
				displayOptions: {
					show: {
						resource: ['discussion'],
						operation: ['pin'],
					},
				},
			},
			{
				name: 'Publish',
				value: 'publish',
				description: 'Publish content',
				action: 'Publish content',
				displayOptions: {
					show: {
						resource: ['discussion', 'blog'],
						operation: ['publish'],
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update content',
				action: 'Update content',
			},
		],
		default: 'create',
	},
];

export const contentFields: INodeProperties[] = [
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['discussion', 'blog', 'doc'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Title of the discussion',
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['discussion', 'blog', 'doc'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Content of the discussion (JSON string)',
	},
	{
		displayName: 'Board',
		name: 'boardId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['discussion', 'blog', 'doc', 'bookmark'],
				operation: ['create', 'update', 'list'],
			},
		},
		default: '',
		description: 'ID of the board to which this discussion belongs',
	},
	{
		displayName: 'Labels',
		name: 'labels',
		type: 'string',
		default: '',
		description: 'Comma-separated labels for the discussion',
		displayOptions: {
			show: {
				resource: ['discussion', 'blog', 'doc', 'bookmark'],
				operation: ['create', 'update'],
			},
		},
	},
	{
		displayName: 'Assignees',
		name: 'assignees',
		type: 'string',
		default: '',
		description: 'Comma-separated DIDs of assignees',
		displayOptions: {
			show: {
				resource: ['discussion', 'blog', 'doc', 'bookmark'],
				operation: ['create', 'update'],
			},
		},
	},
	{
		displayName: 'Publish',
		name: 'publish',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['discussion', 'blog'],
				operation: ['create'],
			},
		},
		default: true,
		description: 'Whether to publish the content',
	},

	{
		displayName: 'Content ID',
		name: 'id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['discussion', 'blog', 'doc', 'bookmark'],
				operation: ['get', 'update', 'publish', 'delete', 'pin'],
			},
		},
		default: '',
		description: 'ID of the content',
	},
	{
		displayName: 'Language',
		name: 'locale',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['blog', 'doc'],
				operation: ['create'],
			},
		},
		default: 'en',
		description: 'Language of the content',
	},
	{
		displayName: 'Slug',
		name: 'slug',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['blog', 'doc'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Slug of the content',
	},
	{
		displayName: 'Parent ID',
		name: 'parentId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['doc'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'ID of the parent content',
	},
	{
		displayName: 'Display Order',
		name: 'order',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['doc'],
				operation: ['create', 'update'],
			},
		},
		default: -1,
		description: 'Display order of the content',
	},

	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['discussion', 'blog', 'doc', 'bookmark'],
				operation: ['list'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['discussion', 'blog', 'doc', 'bookmark'],
				operation: ['list'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
	},
];
