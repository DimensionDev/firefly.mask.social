import { compact, first } from 'lodash-es';

import { readImageAsBlob } from '@/helpers/readImageAsBlob.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { steganographyDecodeImage } from '@/services/steganography.js';

export type EncryptedPayload = readonly [string | Uint8Array, '1' | '2'];

export function getEncryptedPayloadFromText(post: Post): EncryptedPayload | undefined {
    const raw = post.metadata.content?.content;
    if (!raw) return;

    const matched = raw.match(/(?:.*)PostData_(v1|v2)=(.*)/);
    if (!matched) return;

    const [, version, payload] = matched;

    if (version === 'v1') return [payload, '1'];
    if (version === 'v2') return [payload, '2'];
    return;
}

export async function getEncryptedPayloadFromImageAttachment(post: Post): Promise<EncryptedPayload | undefined> {
    const result =
        post.metadata.content?.attachments?.map(async (attachment) => {
            if (attachment.type !== 'Image') return;
            if (!attachment.uri) return;

            const image = document.querySelector<HTMLImageElement>(`img[src="${attachment.uri}"]`);
            const payload = image ? await readImageAsBlob(image) : attachment.uri;
            const decoded = await steganographyDecodeImage(payload || attachment.uri);
            if (!decoded) return;

            return [decoded, '2'] as EncryptedPayload;
        }) ?? [];

    const allSettled = await Promise.allSettled(result);
    return first(compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : null))));
}
