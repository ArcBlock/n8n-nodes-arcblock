import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

export class DiscussKitApi implements ICredentialType {
	name = 'discussKitApi';

	displayName = 'Discuss Kit API';

	documentationUrl = 'https://store.blocklet.dev/blocklets/z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu';

	properties: INodeProperties[] = [
		{
			displayName: 'App URL',
			name: 'url',
			required: true,
			type: 'string',
			default: '',
			description: 'The URL of the Discuss Kit component in your blocklet, including the mount path',
		},
		{
			displayName: 'Access Key',
			name: 'accessKey',
			required: true,
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'The access key to access your blocklet, https://www.arcblock.io/docs/blocklet-developer/en/access-key',
		},
	];

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		requestOptions.headers = {
			'Authorization': `Bearer ${credentials.accessKey}`,
		};

		if (requestOptions.method === 'GET') {
			delete requestOptions.body;
		}

		return requestOptions;
	}

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.url}}',
			url: '/api/chat/chats',
			method: 'GET',
		},
	};
}
