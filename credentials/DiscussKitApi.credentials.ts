import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';
import { joinURL } from 'ufo';

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
		const url = new URL(credentials.url as string);
		const blockletJsUrl = `${url.origin}/__blocklet__.js?type=json`;

		const response = await fetch(blockletJsUrl, {
			method: "GET",
			headers: {
				Accept: "application/json",
			}
		});
		if (!response.ok) {
			throw new Error(`Failed to fetch blocklet json: ${response.status} ${response.statusText}, ${blockletJsUrl}`);
		}

		const config = await response.json();
		const component = config.componentMountPoints.find((component: any) => component.did === 'z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu');
		if (!component) {
			throw new Error(`Discuss Kit not found in: ${credentials.url}`);
		}

		requestOptions.baseURL = url.origin;
		requestOptions.url = joinURL(component.mountPoint, requestOptions.url);
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
