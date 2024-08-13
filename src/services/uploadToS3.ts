import { type PutObjectCommandInput, S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuid } from 'uuid';

import { type SocialSourceInURL } from '@/constants/enum.js';
import { SUFFIX_NAMES } from '@/constants/index.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

const uploadedCache = new WeakMap<File, string | Promise<string>>();

export async function uploadToS3(file: File, source: SocialSourceInURL): Promise<string> {
    const hit = uploadedCache.get(file);
    if (typeof hit === 'string' || hit instanceof Promise) return hit;
    const promise = new Promise<string>(async (resolve, reject) => {
        try {
            const mediaToken = await FireflySocialMediaProvider.getS3UploadMediaToken();
            const client = new S3({
                credentials: {
                    accessKeyId: mediaToken.accessKeyId,
                    secretAccessKey: mediaToken.secretAccessKey,
                    sessionToken: mediaToken.sessionToken,
                },
                region: mediaToken.region || 'us-west-2',
                maxAttempts: 5,
            });

            const params: PutObjectCommandInput = {
                Bucket: mediaToken.bucket,
                Key: `${source.toLowerCase()}/${uuid()}.${SUFFIX_NAMES[file.type as keyof typeof SUFFIX_NAMES]}`,
                Body: file,
                ContentType: file.type,
            };
            const task = new Upload({
                client,
                params,
                partSize: 1024 * 1024 * 400,
                queueSize: 3,
            });

            await task.done();

            const url = `https://${mediaToken.cdnHost}/${params.Key}`;
            uploadedCache.set(file, url);
            resolve(url);
        } catch (err) {
            // So that we can retry uploading
            uploadedCache.delete(file);
            reject(err);
        }
    });
    uploadedCache.set(file, promise);

    return promise;
}
