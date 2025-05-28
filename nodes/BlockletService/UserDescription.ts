import type { INodeProperties } from 'n8n-workflow';

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		description: 'Choose an operation',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
		options: [
			{
				name: 'Get Owner',
				value: 'getOwner',
				description: 'Get the owner of the blocklet',
				action: 'Get the owner of the blocklet',
			},
			{
				name: 'Get User',
				value: 'getUser',
				description: 'Get a user by DID',
				action: 'Get a user by DID',
			},
			{
				name: 'Get Users',
				value: 'getUsers',
				description: 'Get many users',
				action: 'Get many users',
			},
			{
				name: 'Login',
				value: 'login',
				description: 'Login a user',
				action: 'Login a user',
			},
			{
				name: 'Update User Approval',
				value: 'updateUserApproval',
				description: 'Update the approval status of a user',
				action: 'Update the approval status of a user',
			},
			{
				name: 'Update User Tags',
				value: 'updateUserTags',
				description: 'Update the tags of a user',
				action: 'Update the tags of a user',
			},
		],
		default: 'getUsers',
	},
];

export const userFields: INodeProperties[] = [
	{
		displayName: 'User DID',
		name: 'did',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getUser', 'updateUserApproval', 'updateUserTags'],
			},
		},
		default: '',
		description: 'DID of the user',
	},
	{
		displayName: 'Enabled Connected Account',
		name: 'enabledConnectedAccount',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getUser', 'getUsers'],
			},
		},
		default: false,
		description: 'Whether to search the connected account of the user',
	},
	{
		displayName: 'User Role',
		name: 'role',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getUsers'],
			},
		},
		default: '',
		description: 'Filter users by role',
	},
	{
		displayName: 'Search Keyword (by Name, Email, Did)',
		name: 'search',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getUsers'],
			},
		},
		default: '',
		description: 'Filter users by search keyword',
	},
	{
		displayName: 'User DIDs',
		name: 'dids',
		type: 'string',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getUsers'],
			},
		},
		default: [],
		description: 'Filter users by DIDs',
	},
	{
		displayName: 'Tag Names or IDs',
		name: 'tags',
		type: 'multiOptions',
		typeOptions: {
			multipleValues: true,
			loadOptionsMethod: 'getTags',
		},
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getUsers', 'updateUserTags'],
			},
		},
		default: [],
		description: 'Filter users by tags. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Include Tags',
		name: 'includeTags',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getUser', 'getUsers'],
			},
		},
		default: false,
		description: 'Whether to include the tags of the user',
	},
	{
		displayName: 'Include Connected Accounts',
		name: 'includeConnectedAccounts',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getUser', 'getUsers'],
			},
		},
		default: false,
		description: 'Whether to include the connected accounts of the user',
	},
	{
		displayName: 'Include Passports',
		name: 'includePassports',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getUser', 'getUsers'],
			},
		},
		default: false,
		description: 'Whether to include the passports of the user',
	},
	{
		displayName: 'User Approved?',
		name: 'approved',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['updateUserApproval'],
			},
		},
		default: false,
		description: 'Whether to include the tags of the user',
	},

	{
		displayName: 'Sort',
		name: 'sort',
		type: 'collection',
		placeholder: 'Add Sort',
		default: {},
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getUsers'],
			},
		},
		options: [
			{
				displayName: 'Updated At',
				name: 'updatedAt',
				type: 'number',
				default: 0,
				description: 'Sort by updated at (1 for ascending, -1 for descending)',
			},
			{
				displayName: 'Created At',
				name: 'createdAt',
				type: 'number',
				default: 0,
				description: 'Sort by created at (1 for ascending, -1 for descending)',
			},
			{
				displayName: 'Last Login At',
				name: 'lastLoginAt',
				type: 'number',
				default: 0,
				description: 'Sort by last login at (1 for ascending, -1 for descending)',
			},
		],
	},

	{
		displayName: 'Paging',
		name: 'paging',
		type: 'collection',
		placeholder: 'Add Paging',
		default: {},
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getUsers'],
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
				default: 50,
				description: 'The number of items per page',
			},
		],
	},
];
