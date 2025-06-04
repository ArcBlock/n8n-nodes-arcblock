import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	JsonObject,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { joinURL } from 'ufo';

export async function blockletComponentApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	path: string,
	body: any = {},
	qs: IDataObject = {},
	headers: IDataObject = {},
	resolveWithFullResponse: boolean = false,
): Promise<any> {
	const options: IRequestOptions = {
		method,
		body,
		qs,
		url: path,
		json: true,
		headers,
		resolveWithFullResponse,
	};

	try {
		if (Object.keys(body as IDataObject).length === 0) {
			delete options.body;
		}
		return await this.helpers.requestWithAuthentication.call(this, 'blockletComponentApi', options);
	} catch (error) {
		console.error(error);
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function getBlockletComponentApi(this: IExecuteFunctions | ILoadOptionsFunctions, path: string) {
	const credentials = await this.getCredentials('blockletComponentApi');
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

	const config = await response.json();
	const component = config.componentMountPoints.find(
		(component: any) => component.did === credentials.componentDid,
	);
	if (!component) {
		throw new Error(`Component ${credentials.componentDid} not found in: ${credentials.url}`);
	}

	return joinURL(url.origin, component.mountPoint, path);
}
