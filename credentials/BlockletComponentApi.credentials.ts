import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';
import { joinURL } from 'ufo';

export class BlockletComponentApi implements ICredentialType {
	name = 'blockletComponentApi';

	displayName = 'Blocklet Component API';

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
		{
			displayName: 'Component DID',
			name: 'componentDid',
			required: true,
			type: 'string',
			default: 'z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu',
			description: 'The DID of the component in your blocklet.',
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

		if (credentials.componentDid) {
			const config = await response.json();
			const component = config.componentMountPoints.find(
				(component: any) => component.did === credentials.componentDid,
			);
			if (!component) {
				throw new Error(`Component ${credentials.componentDid} not found in: ${credentials.url}`);
			}

			requestOptions.baseURL = url.origin;
			requestOptions.url = joinURL(component.mountPoint, requestOptions.url);
		}

		if (requestOptions.headers) {
			requestOptions.headers['Authorization'] = `Bearer ${credentials.accessKey}`;
		} else {
			requestOptions.headers = { Authorization: `Bearer ${credentials.accessKey}` };
		}

		if (requestOptions.method === 'GET') {
			delete requestOptions.body;
		}

		return requestOptions;
	}

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.url}}',
			url: '/.well-known/service/api/did/session',
			method: 'GET',
		},
	};
}
