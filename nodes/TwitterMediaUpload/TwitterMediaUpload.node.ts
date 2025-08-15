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

import { Readable } from 'node:stream';
// @ts-ignore
import * as mime from 'mime-types';
// @ts-ignore
import isUrl from 'is-url';
import { v4 as uuidv4 } from 'uuid';

// Helper to convert stream to buffer if needed
async function streamToBuffer(stream: Readable): Promise<Buffer> {
	const chunks: Buffer[] = [];
	for await (const chunk of stream) {
		chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
	}
	return Buffer.concat(chunks);
}

// Helper to get media category based on mime type
function getMediaCategory(mimeType: string): string {
	if (mimeType.startsWith('video/')) {
		return 'tweet_video';
	} else if (mimeType.startsWith('image/gif')) {
		return 'tweet_gif';
	} else if (mimeType.startsWith('image/')) {
		return 'tweet_image';
	}
	return 'tweet_image';
}

// Helper to build request options with proxy support
function buildRequestOptions(baseOptions: any, proxyUrl?: string): any {
	const options = { ...baseOptions };
	
	if (proxyUrl && proxyUrl.trim() !== '') {
		// Add proxy configuration
		options.proxy = proxyUrl;
		
		// For some request libraries, we might need to set these explicitly
		options.tunnel = false;
	}
	
	return options;
}

export class TwitterMediaUpload implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitter Media Upload',
		name: 'twitterMediaUpload',
		icon: 'file:twitter-media-upload.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Upload media to Twitter using session tokens',
		defaults: {
			name: 'Twitter Media Upload',
		},
		usableAsTool: true,
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
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
						description: 'Upload media file to Twitter',
						action: 'Upload media file to twitter',
					},
				],
				default: 'uploadMedia',
			},
			{
				displayName: 'Session Token',
				name: 'sessionToken',
				type: 'string',
				typeOptions: { password: true },
				required: true,
				default: '',
				description: 'Twitter session token (auth_token cookie value)',
				displayOptions: {
					show: {
						operation: ['uploadMedia'],
					},
				},
			},
			{
				displayName: 'CSRF Token',
				name: 'csrfToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Twitter CSRF token (ct0 cookie value) - optional but may be required for some accounts',
				displayOptions: {
					show: {
						operation: ['uploadMedia'],
					},
				},
			},
			{
				displayName: 'Input Type',
				name: 'inputType',
				type: 'options',
				options: [
					{
						name: 'Media URL',
						value: 'url',
						description: 'Provide a URL to the media file',
					},
					{
						name: 'Binary Data',
						value: 'binary',
						description: 'Use binary data from previous node',
					},
				],
				default: 'url',
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
				required: true,
				description: 'URL of the media file to upload',
				displayOptions: {
					show: {
						operation: ['uploadMedia'],
						inputType: ['url'],
					},
				},
			},
			{
				displayName: 'Binary Property Name',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				description: 'Name of the binary property containing the media data',
				displayOptions: {
					show: {
						operation: ['uploadMedia'],
						inputType: ['binary'],
					},
				},
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['uploadMedia'],
					},
				},
				options: [
					{
						displayName: 'Alt Text',
						name: 'altText',
						type: 'string',
						default: '',
						description: 'Alternative text for accessibility',
					},
					{
						displayName: 'Media Category Override',
						name: 'mediaCategory',
						type: 'options',
						options: [
							{ name: 'Auto Detect', value: 'auto' },
							{ name: 'Tweet Image', value: 'tweet_image' },
							{ name: 'Tweet Video', value: 'tweet_video' },
							{ name: 'Tweet GIF', value: 'tweet_gif' },
						],
						default: 'auto',
						description: 'Override automatic media category detection',
					},
					{
						displayName: 'HTTP Proxy',
						name: 'httpProxy',
						type: 'string',
						default: '',
						placeholder: 'http://username:password@proxy-server:port',
						description: 'HTTP proxy server URL with optional authentication (e.g., http://user:pass@proxy.com:8080)',
						typeOptions: { password: true },
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;

		for (let i = 0; i < length; i++) {
			const operation = this.getNodeParameter('operation', i);

			try {
				if (operation === 'uploadMedia') {
					const sessionToken = this.getNodeParameter('sessionToken', i) as string;
					const csrfToken = this.getNodeParameter('csrfToken', i) as string;
					const inputType = this.getNodeParameter('inputType', i) as string;
					const additionalOptions = this.getNodeParameter('additionalOptions', i) as IDataObject;
					
					// Get proxy configuration
					const proxyUrl = additionalOptions.httpProxy as string;

					let fileName: string;
					let mimeType: string;
					let fileBuffer: Buffer;
					let fileSize: number;

					// Get media data based on input type
					if (inputType === 'url') {
						const mediaUrl = this.getNodeParameter('mediaUrl', i) as string;
						
						if (!isUrl(mediaUrl)) {
							throw new ApplicationError('Invalid media URL provided');
						}

						// Download the media file
						const downloadOptions = buildRequestOptions({
							uri: mediaUrl,
							encoding: null,
							resolveWithFullResponse: true,
						}, proxyUrl);
						
						const response = await this.helpers.request(downloadOptions);

						fileBuffer = Buffer.from(response.body);
						fileSize = fileBuffer.length;
						
						// Extract filename from URL or content-disposition
						const contentDisposition = response.headers['content-disposition'];
						fileName = (contentDisposition && /filename="?([^"]+)"?/.exec(contentDisposition)?.[1]) ||
							mediaUrl.split('/').pop() ||
							`media_${uuidv4()}`;
						
						mimeType = response.headers['content-type'] ||
							mime.lookup(fileName) ||
							'application/octet-stream';
					} else {
						// Binary data input
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
						const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
						
						fileName = binaryData.fileName || `media_${uuidv4()}`;
						mimeType = binaryData.mimeType || mime.lookup(fileName) || 'application/octet-stream';
						
						fileBuffer = binaryData.id
							? await this.helpers.getBinaryStream(binaryData.id).then(streamToBuffer)
							: Buffer.from(binaryData.data, BINARY_ENCODING);
						fileSize = fileBuffer.length;
					}

					// Determine media category
					let mediaCategory = additionalOptions.mediaCategory as string || 'auto';
					if (mediaCategory === 'auto') {
						mediaCategory = getMediaCategory(mimeType);
					}

					// Validate file size limits
					const maxSizes = {
						tweet_image: 5 * 1024 * 1024, // 5MB
						tweet_gif: 15 * 1024 * 1024,  // 15MB
						tweet_video: 512 * 1024 * 1024, // 512MB
					};

					const maxSize = maxSizes[mediaCategory as keyof typeof maxSizes] || maxSizes.tweet_image;
					if (fileSize > maxSize) {
						throw new ApplicationError(
							`File size ${fileSize} bytes exceeds maximum allowed size of ${maxSize} bytes for ${mediaCategory}`
						);
					}

					// Prepare cookies for authentication
					const cookieParts = [`auth_token=${sessionToken}`];
					if (csrfToken) {
						cookieParts.push(`ct0=${csrfToken}`);
					}
					const cookies = cookieParts.join('; ');

					// Step 1: Initialize media upload (INIT command)
					const baseHeaders: Record<string, string> = {
						'Cookie': cookies,
						'Content-Type': 'application/x-www-form-urlencoded',
					};
					if (csrfToken) {
						baseHeaders['X-CSRF-Token'] = csrfToken;
					}

					const initOptions = buildRequestOptions({
						method: 'POST',
						uri: 'https://upload.twitter.com/1.1/media/upload.json',
						headers: baseHeaders,
						form: {
							command: 'INIT',
							total_bytes: fileSize,
							media_type: mimeType,
							media_category: mediaCategory,
						},
						json: true,
					}, proxyUrl);
					
					const initResponse = await this.helpers.request(initOptions);

					if (!initResponse.media_id_string) {
						throw new ApplicationError('Failed to initialize media upload - no media_id received');
					}

					const mediaId = initResponse.media_id_string;

					// Step 2: Upload media in chunks (APPEND command)
					const chunkSize = 4 * 1024 * 1024; // 4MB chunks
					let segmentIndex = 0;

					for (let offset = 0; offset < fileSize; offset += chunkSize) {
						const chunk = fileBuffer.slice(offset, Math.min(offset + chunkSize, fileSize));
						
						const formData = {
							command: 'APPEND',
							media_id: mediaId,
							segment_index: segmentIndex,
							media: chunk,
						};

						const appendHeaders: Record<string, string> = {
							'Cookie': cookies,
						};
						if (csrfToken) {
							appendHeaders['X-CSRF-Token'] = csrfToken;
						}

						const appendOptions = buildRequestOptions({
							method: 'POST',
							uri: 'https://upload.twitter.com/1.1/media/upload.json',
							headers: appendHeaders,
							formData,
						}, proxyUrl);
						
						await this.helpers.request(appendOptions);

						segmentIndex++;
					}

					// Step 3: Finalize upload (FINALIZE command)
					const finalizeForm: any = {
						command: 'FINALIZE',
						media_id: mediaId,
					};

					// Add alt text if provided
					if (additionalOptions.altText) {
						finalizeForm.alt_text = JSON.stringify({
							text: additionalOptions.altText,
						});
					}

					const finalizeHeaders: Record<string, string> = {
						'Cookie': cookies,
						'Content-Type': 'application/x-www-form-urlencoded',
					};
					if (csrfToken) {
						finalizeHeaders['X-CSRF-Token'] = csrfToken;
					}

					const finalizeOptions = buildRequestOptions({
						method: 'POST',
						uri: 'https://upload.twitter.com/1.1/media/upload.json',
						headers: finalizeHeaders,
						form: finalizeForm,
						json: true,
					}, proxyUrl);
					
					const finalizeResponse = await this.helpers.request(finalizeOptions);

					// Step 4: Check processing status for videos
					let processingComplete = true;
					if (mediaCategory === 'tweet_video' && finalizeResponse.processing_info) {
						processingComplete = false;
						let checkCount = 0;
						const maxChecks = 30; // Maximum 5 minutes of checking

						while (!processingComplete && checkCount < maxChecks) {
							await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

							const statusHeaders: Record<string, string> = {
								'Cookie': cookies,
							};
							if (csrfToken) {
								statusHeaders['X-CSRF-Token'] = csrfToken;
							}

							const statusOptions = buildRequestOptions({
								method: 'GET',
								uri: `https://upload.twitter.com/1.1/media/upload.json?command=STATUS&media_id=${mediaId}`,
								headers: statusHeaders,
								json: true,
							}, proxyUrl);
							
							const statusResponse = await this.helpers.request(statusOptions);

							if (statusResponse.processing_info) {
								const state = statusResponse.processing_info.state;
								if (state === 'succeeded') {
									processingComplete = true;
								} else if (state === 'failed') {
									throw new ApplicationError(`Media processing failed: ${statusResponse.processing_info.error?.message || 'Unknown error'}`);
								}
								// If still in progress, continue loop
							} else {
								processingComplete = true;
							}

							checkCount++;
						}

						if (!processingComplete) {
							throw new ApplicationError('Media processing timed out after 5 minutes');
						}
					}

					const result = {
						success: true,
						media_id: mediaId,
						media_id_string: mediaId,
						size: fileSize,
						media_type: mimeType,
						media_category: mediaCategory,
						fileName,
						processing_complete: processingComplete,
						expires_after_secs: finalizeResponse.expires_after_secs,
					};

					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray([result]),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
				}
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