import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { blockletComponentApiRequest } from '../BlockletComponent/GenericFunctions';

export class VoteKit implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Vote Kit',
		name: 'voteKit',
		icon: 'file:vote-kit.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Consume Vote Kit API',
		defaults: {
			name: 'Vote Kit',
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
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create Option',
						value: 'createOption',
					},
					{
						name: 'Create Vote',
						value: 'createVote',
					},
					{
						name: 'Delete Option',
						value: 'deleteOption',
					},
					{
						name: 'Delete Vote',
						value: 'deleteVote',
					},
					{
						name: 'Get Vote',
						value: 'getVote',
					},
					{
						name: 'List Votes',
						value: 'listVotes',
					},
					{
						name: 'Update Option',
						value: 'updateOption',
					},
					{
						name: 'Update Vote',
						value: 'updateVote',
					},
				],
				default: 'listVotes',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Title of the vote/option',
				displayOptions: {
					show: {
						operation: ['createVote', 'createOption', 'updateVote', 'updateOption'],
					},
				},
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the vote',
				displayOptions: {
					show: {
						operation: ['createVote', 'updateVote'],
					},
				},
			},
			{
				displayName: 'Max Vote Per User',
				name: 'maxVotePerUser',
				type: 'number',
				default: 1,
				description: 'Maximum votes per user',
				displayOptions: {
					show: {
						operation: ['createVote', 'updateVote'],
					},
				},
			},
			{
				displayName: 'Winner Count',
				name: 'winnerCount',
				type: 'number',
				default: 1,
				description: 'Number of winners',
				displayOptions: {
					show: {
						operation: ['createVote', 'updateVote'],
					},
				},
			},
			{
				displayName: 'Start Time',
				name: 'startTime',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						operation: ['createVote', 'updateVote'],
					},
				},
			},
			{
				displayName: 'End Time',
				name: 'deadline',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						operation: ['createVote', 'updateVote'],
					},
				},
			},
			{
				displayName: 'Public Voter Info',
				name: 'publicVoterInfo',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						operation: ['createVote', 'updateVote'],
					},
				},
			},
			{
				displayName: 'Public Option Create',
				name: 'publicCreate',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						operation: ['createVote', 'updateVote'],
					},
				},
			},
			{
				displayName: 'Public Comment',
				name: 'comment',
				type: 'boolean',
				default: true,
				description: 'Whether to allow comments',
				displayOptions: {
					show: {
						operation: ['createVote', 'updateVote'],
					},
				},
			},
			{
				displayName: 'Allow Update Vote',
				name: 'revote',
				type: 'boolean',
				default: true,
				description: 'Whether to allow vote',
				displayOptions: {
					show: {
						operation: ['createVote', 'updateVote'],
					},
				},
			},
			{
				displayName: 'Hide Result Before End',
				name: 'hideResultBeforeEnd',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: ['createVote', 'updateVote'],
					},
				},
			},
			{
				displayName: 'Has Bonus',
				name: 'addBonus',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						operation: ['createVote', 'updateVote'],
					},
				},
			},
			{
				displayName: 'Share Bonus to Voters',
				name: 'rewardVoters',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: ['createVote', 'updateVote'],
						addBonus: [true],
					},
				},
			},
			{
				displayName: 'Bonus Percentage for Voters',
				name: 'votersBonusPercentage',
				type: 'number',
				default: 20,
				displayOptions: {
					show: {
						operation: ['createVote', 'updateVote'],
						rewardVoters: [true],
					},
				},
			},
			{
				displayName: 'Limit Options Per User',
				name: 'enableOptionLimit',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						operation: ['createVote', 'updateVote'],
					},
				},
			},
			{
				displayName: 'Max Options Per User',
				name: 'optionLimit',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						operation: ['createVote', 'updateVote'],
						enableOptionLimit: [true],
					},
				},
			},
			{
				displayName: 'Vote Options',
				name: 'options',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				displayOptions: {
					show: {
						operation: ['createVote', 'updateVote'],
					},
				},
			},
			{
				displayName: 'Vote ID',
				name: 'pollId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['createOption', 'updateOption', 'deleteOption', 'updateVote', 'deleteVote', 'getVote'],
					},
				},
			},
			{
				displayName: 'Option ID',
				name: 'optionId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['updateOption', 'deleteOption'],
					},
				},
			},
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'number',
				default: 10,
				displayOptions: {
					show: {
						operation: ['listVotes'],
					},
				},
			},
			{
				displayName: 'Page Count',
				name: 'page',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						operation: ['listVotes'],
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
		for (let i = 0; i < length; i++) {
			const operation = this.getNodeParameter('operation', i);

			try {
				if (operation === 'createVote' || operation === 'updateVote') {
          const pollId = operation === 'createVote' ? '' : (this.getNodeParameter('pollId', i) as string);
          let exist = operation === 'createVote' ? null : await blockletComponentApiRequest.call(
            this,
            'GET',
            `/api/poll/${pollId}`,
            {},
          );

          const defaults = operation === 'createVote' ? {
            maxVotePerUser: 1,
            winnerCount: 1,
            publicVoterInfo: true,
            publicCreate: false,
            revote: false,
            comment: true,
            hideResultBeforeEnd: false,
            addBonus: false,
            rewardVoters: false,
            votersBonusPercentage: 0,
            enableOptionLimit: false,
            options: [],
          } : exist.data;

					const title = this.getNodeParameter('title', i) as string;
					const description = this.getNodeParameter('description', i) as string;
					const maxVotePerUser = (this.getNodeParameter('maxVotePerUser', i) as number) || defaults.maxVotePerUser;
					const winnerCount = (this.getNodeParameter('winnerCount', i) as number) || defaults.winnerCount;
					const deadline = this.getNodeParameter('deadline', i) as string;
					const startTime = this.getNodeParameter('startTime', i) as string;
					const publicVoterInfo = (this.getNodeParameter('publicVoterInfo', i) as boolean) || defaults.publicVoterInfo;
					const publicCreate = (this.getNodeParameter('publicCreate', i) as boolean) || defaults.publicCreate;
					const revote = (this.getNodeParameter('revote', i) as boolean) || defaults.revote;
					const comment = (this.getNodeParameter('comment', i) as boolean) || defaults.comment;
					const hideResultBeforeEnd =
						(this.getNodeParameter('hideResultBeforeEnd', i) as boolean) || defaults.hideResultBeforeEnd;
					const addBonus = (this.getNodeParameter('addBonus', i) as boolean) || defaults.addBonus;
					const rewardVoters = (this.getNodeParameter('rewardVoters', i) as boolean) || defaults.rewardVoters;
					const votersBonusPercentage = rewardVoters
						? (this.getNodeParameter('votersBonusPercentage', i) as number)
						: 0;
					const enableOptionLimit =
						(this.getNodeParameter('enableOptionLimit', i) as boolean) || defaults.enableOptionLimit;
					const optionLimit = enableOptionLimit
						? (this.getNodeParameter('optionLimit', i) as number)
						: defaults.optionLimit;
					const options = (this.getNodeParameter('options', i) as unknown as string[]);


					const body = {
						title,
						description,
						maxVotePerUser,
						winnerCount,
						deadline,
						startTime,
						publicVoterInfo,
						publicCreate,
						revote,
						comment,
						hideResultBeforeEnd,
						addBonus,
						tokenAddress: 'z35nNRvYxBoHitx9yZ5ATS88psfShzPPBLxYD',
						rewardVoters,
						votersBonusPercentage,
						enableOptionLimit,
						optionLimit,
						options: options.length > 0 ? options : defaults.options,
						action: operation === 'createVote' ? 'publish' : '',
					};

          if (pollId) {
            // @ts-ignore
            body._id = pollId;
          }

					result = await blockletComponentApiRequest.call(
						this,
						'POST',
						operation === 'createVote' ? '/api/admin/poll/create' : `/api/admin/poll/update/${pollId}`,
						body,
					);
				}

        if (operation === 'getVote') {
          const pollId = this.getNodeParameter('pollId', i) as string;
          result = await blockletComponentApiRequest.call(
            this,
            'GET',
            `/api/poll/${pollId}`,
            {},
          );
        }

        if (operation === 'deleteVote') {
          const pollId = this.getNodeParameter('pollId', i) as string;
          result = await blockletComponentApiRequest.call(
            this,
            'DELETE',
            `/api/admin/poll/delete/${pollId}`,
            {},
          );
        }

        if (operation === 'listVotes') {
          const pageSize = (this.getNodeParameter('pageSize', i) as number) || 10;
          const page = (this.getNodeParameter('page', i) as number) || 1;

          result = await blockletComponentApiRequest.call(
            this,
            'GET',
            `/api/poll/list/page?size=${pageSize}&offset=${(page - 1) * pageSize}`,
            {},
          );
        }

        if (operation === 'createOption') {
          const title = this.getNodeParameter('title', i) as string;
          const pollId = this.getNodeParameter('pollId', i) as string;

          const body = {
            pollId,
            title,
          };

          result = await blockletComponentApiRequest.call(
            this,
            'POST',
            '/api/poll-options/create',
            body,
          );
        }

        if (operation === 'updateOption') {
          const title = this.getNodeParameter('title', i) as string;
          const pollId = this.getNodeParameter('pollId', i) as string;
          const optionId = this.getNodeParameter('optionId', i) as string;

          const body = {
            pollId,
            title,
          };

          result = await blockletComponentApiRequest.call(
            this,
            'POST',
            `/api/poll-options/update/${optionId}`,
            body,
          );
        }

        if (operation === 'deleteOption') {
          const pollId = this.getNodeParameter('pollId', i) as string;
          const optionId = this.getNodeParameter('optionId', i) as string;

          const body = {
            pollId,
          };

          result = await blockletComponentApiRequest.call(
            this,
            'DELETE',
            `/api/poll-options/${optionId}`,
            body,
          );
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
