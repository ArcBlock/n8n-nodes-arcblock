import type { INodeProperties } from 'n8n-workflow';

export const boardOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		description: 'Choose an operation',
		required: true,
		displayOptions: {
			show: {
				resource: ['board'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a board',
				action: 'Create a board',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many boards',
				action: 'Get many boards',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a board',
				action: 'Update a board',
			},
		],
		default: 'create',
	},
];

export const boardFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                board:create */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Title of the board',
	},
	{
		displayName: 'Description',
		name: 'desc',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Description of the board',
	},
	{
		displayName: 'Passports',
		name: 'passports',
		type: 'string',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['create'],
			},
		},
		default: [],
		description: 'List of passports for the board',
	},
	{
		displayName: 'Cover',
		name: 'cover',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Cover image URL for the board',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		options: [
			{ name: 'Discussion', value: 'discussion', description: 'Discussion board' },
			{ name: 'Blog', value: 'blog', description: 'Blog board' },
			{ name: 'Bookmark', value: 'bookmark', description: 'Bookmark board' },
			{ name: 'Documentation', value: 'doc', description: 'Documentation board' },
		],
		default: 'discussion',
		description: 'Type of the board',
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['create'],
			},
		},
	},

	/* -------------------------------------------------------------------------- */
	/*                                board:getAll                                */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['board'],
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
				resource: ['board'],
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
	/*                                board:update                                */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Board ID',
		name: 'groupId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'ID of the board to update',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['board'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'New name of the board',
	},
];
