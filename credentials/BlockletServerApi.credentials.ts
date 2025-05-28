import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';
import { joinURL } from 'ufo';

export class BlockletServerApi implements ICredentialType {
	name = 'blockletServerApi';

	displayName = 'Blocklet Server API';

	documentationUrl = 'https://www.arcblock.io/docs/blocklet-developer/en/access-key';

	properties: INodeProperties[] = [
		{
			displayName: 'Blocklet Server URL',
			name: 'url',
			required: true,
			type: 'string',
			default: '',
			description: 'The URL of your blocklet server.',
		},
		{
			displayName: 'Access Key',
			name: 'accessKey',
			required: true,
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'The access key to access your blocklet server.',
		},
	];

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const url = new URL(credentials.url as string);
		const didJsonUrl = `${url.origin}/.well-known/did.json`;

		const response = await fetch(didJsonUrl, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error(
				`Failed to fetch blocklet json: ${response.status} ${response.statusText}, ${didJsonUrl}`,
			);
		}

		const json = await response.json();
		const service = json.services.find((service: any) => service.type === 'server');
		if (!service) {
			throw new Error(`Server not found in: ${didJsonUrl}`);
		}

		requestOptions.baseURL = url.origin;
		requestOptions.url = joinURL(service.path, '/api/gql');
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
			url: '/api/gql',
			method: 'POST',
			body: {
				query: `
					getBlocklets {
						code
					}
				`,
			},
		},
	};
}
