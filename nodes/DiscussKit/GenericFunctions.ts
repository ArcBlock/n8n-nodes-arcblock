import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	JsonObject,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export async function discussKitApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	path: string,
	body: any = {},
	qs: IDataObject = {},
	_option = {},
): Promise<any> {
	const options: IRequestOptions = {
		method,
		body,
		qs,
		url: path,
		json: true,
	};

	try {
		if (Object.keys(body as IDataObject).length === 0) {
			delete options.body;
		}
		return await this.helpers.requestWithAuthentication.call(this, 'blockletComponentApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
