import { compact, first } from 'lodash-es';

import { memoizePromise } from '@/helpers/memoizePromise.js';
import type { Attachment } from '@/providers/types/SocialMedia.js';
import { steganographyDecodeImage } from '@/services/steganography.js';

export type EncryptedPayload = readonly [string | Uint8Array, '1' | '2', string | null];

const POST_DATA_REGEX = /(?:.*)PostData_(v1|v2)=(.*)/;

export function getEncryptedPayloadFromText(text: string | undefined): EncryptedPayload | undefined {
    if (!text) return;

    const matched = text.match(POST_DATA_REGEX);
    if (!matched) return;

    const [, version, payload] = matched;

    if (version === 'v1') return [payload, '1', null];
    if (version === 'v2') return [payload, '2', null];
    return;
}

const decodeAttachment = memoizePromise(
    async (attachment: Attachment) => {
        if (attachment.type !== 'Image') return;
        if (!attachment.uri) return;

        const decoded = await steganographyDecodeImage(attachment.uri);
        if (!decoded) return;

        if (typeof decoded === 'string' && decoded.match(POST_DATA_REGEX)) {
            const reDecoded = getEncryptedPayloadFromText(decoded);
            if (reDecoded) {
                const [decoded, version] = reDecoded;
                return [decoded, version, attachment.uri] as EncryptedPayload;
            }
        }

        return [decoded, '2', attachment.uri] as EncryptedPayload;
    },
    (x) => x.uri,
);

export async function getEncryptedPayloadFromImageAttachment(
    attachments: Attachment[] | undefined,
): Promise<EncryptedPayload | undefined> {
    if (!attachments) return undefined;
    const result = attachments.map(decodeAttachment);
    const allSettled = await Promise.allSettled(result);
    return first(compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : null))));
}
