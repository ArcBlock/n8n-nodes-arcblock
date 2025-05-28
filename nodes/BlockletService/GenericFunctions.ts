import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	JsonObject,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import Client from '@abtnode/client';


export async function blockletServiceApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	args: any = {},
): Promise<any> {
	const credentials = await this.getCredentials('blockletServiceApi');
	const url = new URL(credentials.url as string);
	const client: any = new Client(url.origin);

	if (typeof client[method] !== 'function') {
		throw new Error(`Method ${method} not found`);
	}
	if (typeof client[method].build !== 'function') {
		throw new Error(`Method ${method} is not a valid graphql wrapper`);
	}

	const jsonUrl = `${url.origin}/__blocklet__.js?type=json`;
	const response = await fetch(jsonUrl, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
		},
	});
	const json = await response.json();

	args.did = json.appPid;
	args.teamDid = json.appPid;

	const options: IRequestOptions = {
		method: 'POST',
		body: {
			query: client[method].build({ input: args }),
		},
		url: '/.well-known/service/api/gql',
		json: true,
	};

	try {
		return await this.helpers.requestWithAuthentication.call(this, 'blockletServiceApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
