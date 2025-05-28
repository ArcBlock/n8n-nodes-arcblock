import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	JsonObject,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import Client from '@abtnode/client';
import { formatError } from '@blocklet/error';
import { joinURL } from 'ufo';

export async function blockletServerApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	args: any = {},
): Promise<any> {
	const credentials = await this.getCredentials('blockletServerApi');
	const url = new URL(credentials.url as string);
	const client: any = new Client(url.origin);

	if (typeof client[method] !== 'function') {
		throw new Error(`Method ${method} not found`);
	}
	if (typeof client[method].builder !== 'function') {
		throw new Error(`Method ${method} is not a valid graphql wrapper`);
	}

	const didJsonUrl = `${url.origin}/.well-known/did.json`;
	const response = await fetch(didJsonUrl, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
		},
	});

	const json = await response.json();
	const service = json.services.find((service: any) => service.type === 'server');

	const options: IRequestOptions = {
		method: 'POST',
		body: {
			query: client[method].builder({ input: args }),
		},
		url: joinURL(service.path, '/api/gql'),
		json: true,
	};

	try {
		const result = await this.helpers.requestWithAuthentication.call(
			this,
			'blockletServerApi',
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
