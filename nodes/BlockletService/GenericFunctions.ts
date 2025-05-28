import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	JsonObject,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import Client from '@abtnode/client';
import { formatError } from '@blocklet/error';

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
	if (typeof client[method].builder !== 'function') {
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
			query: client[method].builder({ input: args }),
		},
		url: '/.well-known/service/api/gql',
		json: true,
	};

	try {
		const result = await this.helpers.requestWithAuthentication.call(
			this,
			'blockletServiceApi',
			options,
		);
		console.log({ method, args, ...result });

		if (result.errors) {
			throw new Error(formatError(result.errors[0]));
		}

		return result.data[method];
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
