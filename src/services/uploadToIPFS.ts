import { S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuid } from 'uuid';

import { FileMimeType } from '@/constants/enum.js';
import { EVER_API, S3_BUCKET } from '@/constants/index.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';

export interface IPFSResponse {
    uri: string;
    mimeType: string;
}

/**
 * Returns an S3 client with temporary credentials obtained from the STS service.
 *
 * @returns S3 client instance.
 */
const getS3Client = async (): Promise<S3> => {
    const accessToken = await LensSocialMediaProvider.getAccessToken();
    const mediaToken = await FireflySocialMediaProvider.getUploadMediaToken(accessToken.unwrap());
    const client = new S3({
        endpoint: EVER_API,
        credentials: {
            accessKeyId: mediaToken.accessKeyId,
            secretAccessKey: mediaToken.secretAccessKey,
            sessionToken: mediaToken.sessionToken,
        },
        region: 'us-west-2',
        maxAttempts: 10,
    });

    client.middlewareStack.addRelativeTo(
        (next: (args: any) => Promise<{ response: any }>) => async (args: any) => {
            const { response } = await next(args);
            if (response.body === null) {
                response.body = new Uint8Array();
            }
            return { response };
        },
        {
            name: 'nullFetchResponseBodyMiddleware',
            toMiddleware: 'deserializerMiddleware',
            relation: 'after',
            override: true,
        },
    );

    return client;
};

/**
 * Uploads a set of files to the IPFS network via S3 and returns an array of MediaSet objects.
 *
 * @param data Files to upload to IPFS.
 * @returns Array of MediaSet objects.
 */
export async function uploadFilesToIPFS(
    files: File[],
    onProgress?: (percentage: number) => void,
): Promise<IPFSResponse[]> {
    const client = await getS3Client();
    const attachments = await Promise.all(
        files.map(async (file) => {
            const params = {
                Bucket: S3_BUCKET.FIREFLY_LENS_MEDIA,
                Key: uuid(),
                Body: file,
                ContentType: file.type,
            };
            const task = new Upload({
                client,
                params,
            });
            task.on('httpUploadProgress', (e) => {
                const loaded = e.loaded ?? 0;
                const total = e.total ?? 0;
                const progress = (loaded / total) * 100;
                onProgress?.(Math.round(progress));
            });
            await task.done();
            const result = await client.headObject(params);
            const metadata = result.Metadata;
            const cid = metadata?.['ipfs-hash'];

            return {
                uri: `ipfs://${cid}`,
                mimeType: file.type || FileMimeType.JPEG,
            };
        }),
    );

    return attachments;
}

/**
 * Uploads a file to the IPFS network via S3 and returns a MediaSet object.
 *
 * @param file File to upload to IPFS.
 * @returns MediaSet object or null if the upload fails.
 */
export async function uploadFileToIPFS(file: File, onProgress?: (percentage: number) => void): Promise<IPFSResponse> {
    const ipfsResponse = await uploadFilesToIPFS([file], onProgress);
    const metadata = ipfsResponse[0];

    return { uri: metadata.uri, mimeType: file.type || FileMimeType.JPEG };
}
