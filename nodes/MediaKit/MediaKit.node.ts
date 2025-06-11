import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	ApplicationError,
	BINARY_ENCODING,
} from 'n8n-workflow';

import {
	blockletComponentApiRequest,
	getBlockletComponentApi,
} from '../BlockletComponent/GenericFunctions';
import { Readable } from 'node:stream';
// @ts-ignore
import * as mime from 'mime-types';
// @ts-ignore
import isUrl from 'is-url';
import { joinURL } from 'ufo';

// Helper to convert stream to buffer if needed
async function streamToBuffer(stream: Readable): Promise<Buffer> {
	const chunks: Buffer[] = [];
	for await (const chunk of stream) {
		chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
	}
	return Buffer.concat(chunks);
}

export class MediaKit implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Media Kit',
		name: 'mediaKit',
		icon: 'file:media-kit.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Consume Media Kit API',
		defaults: {
			name: 'Media Kit',
		},
		usableAsTool: true,
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'blockletComponentApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Upload Media',
						value: 'uploadMedia',
					},
					{
						name: 'List Media',
						value: 'listMedia',
					},
				],
				default: 'listMedia',
			},
			{
				displayName: 'Binary Data Name',
				name: 'binaryDataName',
				type: 'string',
				default: '',
				description: 'Name of the binary property in which the media data can be found',
				displayOptions: {
					show: {
						operation: ['uploadMedia'],
					},
				},
			},
			{
				displayName: 'Media URL',
				name: 'mediaUrl',
				type: 'string',
				default: '',
				description: 'The URL to upload (must be a valid URI)',
				displayOptions: {
					show: {
						operation: ['uploadMedia'],
					},
				},
			},
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'number',
				default: 100,
				typeOptions: {
					minValue: 10,
					maxValue: 1000,
				},
				displayOptions: {
					show: {
						operation: ['listMedia'],
					},
				},
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						operation: ['listMedia'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		let result;
		for (let i = 0; i < length; i++) {
			const operation = this.getNodeParameter('operation', i);

			try {
				if (operation === 'uploadMedia') {
					const binaryDataName = this.getNodeParameter('binaryDataName', i);
					const mediaUrl = this.getNodeParameter('mediaUrl', i);

					let fileName: string;
					let mimeType: string;
					let fileExt: string;
					let fileSize: number;
					let fileBuffer: Buffer;

					if (binaryDataName && mediaUrl) {
						throw new ApplicationError('Only one of binaryDataName or mediaUrl can be provided');
					} else if (binaryDataName) {
						const binaryData = this.helpers.assertBinaryData(i, binaryDataName as string);
						fileName = binaryData.fileName || binaryData.id || 'file';
						mimeType = binaryData.mimeType || mime.lookup(fileName) || 'application/octet-stream';
						fileExt = mime.extension(mimeType) || fileName.split('.').pop() || '';
						fileBuffer = binaryData.id
							? await this.helpers.getBinaryStream(binaryData.id).then(streamToBuffer)
							: Buffer.from(binaryData.data, BINARY_ENCODING);
						fileSize = fileBuffer.length;
					} else if (mediaUrl) {
						if (!isUrl(mediaUrl)) {
							throw new ApplicationError('Invalid media URL');
						}

						const response = await this.helpers.request({
							uri: mediaUrl as string,
							encoding: null,
							resolveWithFullResponse: true,
						});
						fileBuffer = Buffer.from(response.body);
						fileSize = fileBuffer.length;
						const contentDisposition = response.headers['content-disposition'];
						fileName =
							(contentDisposition && /filename="?([^"]+)"?/.exec(contentDisposition)?.[1]) ||
							(mediaUrl as string).split('/').pop() ||
							'file';
						mimeType =
							response.headers['content-type'] ||
							mime.lookup(fileName) ||
							'application/octet-stream';
						fileExt = mime.extension(mimeType) || fileName.split('.').pop() || '';
					} else {
						throw new ApplicationError('No binary data name or media URL provided');
					}

					const baseUrl = await getBlockletComponentApi.call(this, '/');
					const uploadApi = '/api/uploads';
					const uploadUrl = joinURL(baseUrl, uploadApi);

					console.info('Preparing upload', {
						mediaUrl,
						binaryDataName,
						fileName,
						mimeType,
						fileExt,
						fileSize,
						baseUrl,
						uploadApi,
						uploadUrl,
					});

					// Generate uploader ID
					const uploaderId = 'Uploader';
					const baseFilename = fileName.split('.').slice(0, -1).join('.') || fileName;
					const fileId = `${uploaderId}-${baseFilename.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`;

					// Create metadata for the upload
					const metadata = {
						uploaderId,
						relativePath: `${baseFilename}.${fileExt}`,
						name: `${baseFilename}.${fileExt}`,
						type: mimeType,
						filetype: mimeType,
						filename: `${baseFilename}.${fileExt}`,
					};

					// Encode metadata for headers
					const encodedMetadata = Object.entries(metadata)
						.map(([key, value]) => `${key} ${Buffer.from(value).toString('base64')}`)
						.join(',');

					console.info(`Starting upload`, metadata);

					// Step 1: Create the upload (POST request)
					const createResponse = await blockletComponentApiRequest.call(
						this,
						'POST',
						uploadApi,
						{},
						{},
						{
							'Tus-Resumable': '1.0.0',
							'Upload-Length': fileSize.toString(),
							'Upload-Metadata': encodedMetadata,
							// Add required x-uploader-* headers
							'x-uploader-file-name': `${baseFilename}.${fileExt}`,
							'x-uploader-file-id': fileId,
							'x-uploader-file-ext': fileExt,
							'x-uploader-base-url': uploadUrl,
							'x-uploader-endpoint-url': uploadUrl,
							'x-uploader-metadata': JSON.stringify({
								uploaderId: 'Uploader',
								relativePath: `${baseFilename}.${fileExt}`,
								name: `${baseFilename}.${fileExt}`,
								type: mimeType,
							}),
						},
						true,
					);

					const targetUrl = createResponse.headers.location;
					if (!targetUrl) {
						throw new ApplicationError('No upload URL received from server');
					}

					console.log(`Upload created at ${targetUrl}`);

					// Step 2: Upload the file content
					const uploadResult = await blockletComponentApiRequest.call(
						this,
						'PATCH',
						targetUrl.replace(baseUrl, ''),
						fileBuffer,
						{},
						{
							'Tus-Resumable': '1.0.0',
							'Upload-Offset': '0',
							'Content-Type': 'application/offset+octet-stream',
							// Add required x-uploader-* headers
							'x-uploader-file-name': `${baseFilename}.${fileExt}`,
							'x-uploader-file-id': fileId,
							'x-uploader-file-ext': fileExt,
							'x-uploader-base-url': uploadUrl,
							'x-uploader-endpoint-url': uploadUrl,
							'x-uploader-metadata': JSON.stringify({
								uploaderId: 'Uploader',
								relativePath: `${baseFilename}.${fileExt}`,
								name: `${baseFilename}.${fileExt}`,
								type: mimeType,
							}),
							'x-uploader-file-exist': 'true',
						},
					);

					const uploadedFileUrl = uploadResult.url;
					if (!uploadedFileUrl) {
						throw new ApplicationError('No URL found in the upload response');
					}
					console.log(`File ${fileName} uploaded successfully: ${uploadedFileUrl}`);

					result = {
						fileName,
						mimeType,
						fileExt,
						fileSize,
						uploadedFileUrl,
					};
				}

				if (operation === 'listMedia') {
					const pageSize = this.getNodeParameter('pageSize', i) || 100;
					const page = this.getNodeParameter('page', i) || 1;
					result = await blockletComponentApiRequest.call(this, 'GET', '/api/uploads', {}, { pageSize, page });
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(result as IDataObject[]),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error.message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}
		return [returnData];
	}
}
