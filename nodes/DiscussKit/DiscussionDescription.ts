import type { INodeProperties } from 'n8n-workflow';

export const discussionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		description: 'Choose an operation',
		required: true,
		displayOptions: {
			show: {
				resource: ['discussion'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a discussion',
				action: 'Create a discussion',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a discussion',
				action: 'Get a discussion',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many discussions',
				action: 'Get many discussions',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a discussion',
				action: 'Update a discussion',
			},
		],
		default: 'create',
	},
];

export const discussionFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                discussion:create                           */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['discussion'],
				operation: ['create'],
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
				resource: ['discussion'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Content of the discussion (JSON string)',
	},
	{
		displayName: 'Board ID',
		name: 'boardId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['discussion'],
				operation: ['create'],
			},
		},
		default: 'discussion-default',
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
				resource: ['discussion'],
				operation: ['create'],
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
				resource: ['discussion'],
				operation: ['create'],
			},
		},
	},
	/* -------------------------------------------------------------------------- */
	/*                                discussion:get                              */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Discussion ID',
		name: 'id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['discussion'],
				operation: ['get'],
			},
		},
		default: '',
		description: 'ID of the discussion',
	},
	/* -------------------------------------------------------------------------- */
	/*                                discussion:getAll                           */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['discussion'],
				operation: ['getAll'],
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
				resource: ['discussion'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	/* -------------------------------------------------------------------------- */
	/*                                discussion:update                           */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Discussion ID',
		name: 'id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['discussion'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'ID of the discussion',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['discussion'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Title of the discussion',
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['discussion'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Content of the discussion (JSON string)',
	},
	{
		displayName: 'Labels',
		name: 'labels',
		type: 'string',
		default: '',
		description: 'Comma-separated labels for the discussion',
		displayOptions: {
			show: {
				resource: ['discussion'],
				operation: ['update'],
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
				resource: ['discussion'],
				operation: ['update'],
			},
		},
	},
];
