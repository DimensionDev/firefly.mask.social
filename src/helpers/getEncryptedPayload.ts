import { compact, first } from 'lodash-es';

import type { Attachment } from '@/providers/types/SocialMedia.js';
import { steganographyDecodeImage } from '@/services/steganography.js';

export type EncryptedPayload = readonly [string | Uint8Array, '1' | '2', string | null];

export function getEncryptedPayloadFromText(text: string | undefined): EncryptedPayload | undefined {
    if (!text) return;

    const matched = text.match(/(?:.*)PostData_(v1|v2)=(.*)/);
    if (!matched) return;

    const [, version, payload] = matched;

    if (version === 'v1') return [payload, '1', null];
    if (version === 'v2') return [payload, '2', null];
    return;
}

const decodedCache = new Map<string, undefined | EncryptedPayload>();
export async function getEncryptedPayloadFromImageAttachment(
    attachments: Attachment[] | undefined,
): Promise<EncryptedPayload | undefined> {
    if (!attachments) return undefined;
    const result = attachments.map(async (attachment) => {
        if (attachment.type !== 'Image') return;
        const uri = attachment.uri;
        if (!uri) return;
        if (decodedCache.has(uri)) return decodedCache.get(uri);

        const decoded = await steganographyDecodeImage(uri);
        if (!decoded) {
            decodedCache.set(uri, undefined);
            return;
        }

        const payload = [decoded, '2', uri] as EncryptedPayload;
        decodedCache.set(uri, payload);
        return payload;
    });

    const allSettled = await Promise.allSettled(result);
    return first(compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : null))));
}
