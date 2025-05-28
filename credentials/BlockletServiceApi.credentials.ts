import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

export class BlockletServiceApi implements ICredentialType {
	name = 'blockletServiceApi';

	displayName = 'Blocklet Service API';

	documentationUrl = 'https://www.arcblock.io/docs/blocklet-developer/en/access-key';

	properties: INodeProperties[] = [
		{
			displayName: 'Blocklet URL',
			name: 'url',
			required: true,
			type: 'string',
			default: '',
			description: 'The URL of your blocklet.',
		},
		{
			displayName: 'Access Key',
			name: 'accessKey',
			required: true,
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'The access key to access your blocklet.',
		},
	];

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const url = new URL(credentials.url as string);
		const blockletJsUrl = `${url.origin}/__blocklet__.js?type=json`;

		const response = await fetch(blockletJsUrl, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error(
				`Failed to fetch blocklet json: ${response.status} ${response.statusText}, ${blockletJsUrl}`,
			);
		}

		requestOptions.baseURL = url.origin;
		requestOptions.url = '/.well-known/service/api/gql';
		requestOptions.headers = {
			Authorization: `Bearer ${credentials.accessKey}`,
		};

		if (requestOptions.method === 'GET') {
			delete requestOptions.body;
		}

		return requestOptions;
	}

	test: ICredentialTestRequest = {
		request: {
				baseURL: '={{$credentials.url}}',
				url: '/.well-known/service/api/gql',
				method: 'POST',
				body: {
					query: `
						getBlocklet(input: { did: "zNKYyCsfQASyGp5Gcz3vmkRyLM73cRG13fVs" }) {
							code
						}
					`,
				},
		},
	};
}
