import type { INodeProperties } from 'n8n-workflow';

export const searchOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		description: 'Choose an operation',
		required: true,
		displayOptions: {
			show: {
				resource: ['search'],
			},
		},
		options: [
			{
				name: 'Query',
				value: 'query',
				description: 'Search for discussions, comments, blogs or bookmarks',
				action: 'Perform a query',
			},
		],
		default: 'query',
	},
];

export const searchFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                search:query                                */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Query',
		name: 'q',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['query'],
			},
		},
		default: '',
		description: 'The search term (q parameter)',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		options: [
			{ name: 'Discussions', value: 'discussions', description: 'Search discussions' },
			{ name: 'Blogs', value: 'blogs', description: 'Search blogs' },
			{ name: 'Bookmarks', value: 'bookmarks', description: 'Search bookmarks' },
			{ name: 'Docs', value: 'docs', description: 'Search documentation' },
		],
		default: 'discussions',
		description: 'Type of search (type parameter)',
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['query'],
			},
		},
	},
	{
		displayName: 'Hybrid Search',
		name: 'isHybrid',
		type: 'boolean',
		default: false,
		description: 'Whether to use hybrid search',
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['query'],
			},
		},
	},
	{
		displayName: 'Exact Match',
		name: 'isExact',
		type: 'boolean',
		default: false,
		description: 'Whether to use exact match',
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['query'],
			},
		},
	},
	{
		displayName: 'Match Any',
		name: 'isMatchAny',
		type: 'boolean',
		default: false,
		description: 'Whether to match any term',
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['query'],
			},
		},
	},
	{
		displayName: 'Include',
		name: 'isInclude',
		type: 'boolean',
		default: false,
		description: 'Whether to include the term',
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['query'],
			},
		},
	},
	{
		displayName: 'With Comments',
		name: 'withComments',
		type: 'boolean',
		default: true,
		description: 'Whether to include comments in the search',
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['query'],
			},
		},
	},
	{
		displayName: 'Sort',
		name: 'sort',
		type: 'options',
		options: [
			{ name: 'Latest', value: 'latest', description: 'Sort by latest' },
			{ name: 'Relevance', value: 'relevance', description: 'Sort by relevance' },
		],
		default: 'latest',
		description: 'Sorting method',
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['query'],
			},
		},
	},
	{
		displayName: 'Offset',
		name: 'offset',
		type: 'number',
		default: 0,
		description: 'Offset for pagination',
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['query'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['query'],
			},
		},
	},
];
