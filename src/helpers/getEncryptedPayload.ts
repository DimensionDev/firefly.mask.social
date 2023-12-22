import { safeUnreachable } from '@masknet/kit';
import { compact, first } from 'lodash-es';

import type { Post } from '@/providers/types/SocialMedia.js';
import { steganographyDecodeImage, SteganographyPreset } from '@/services/steganography.js';
import { fetchBlob } from '@/helpers/fetchBlob.js';

export type EncryptedPayload = [string, '1' | '2'];

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

            const image = attachment.uri ? await fetchBlob(attachment.uri) : null;
            if (!image) return;

            const decoded = await steganographyDecodeImage(image);
            if (!decoded) return;

            const [result, preset] = decoded;

            if (preset === SteganographyPreset.Preset2023) {
                return [result, '2'] as EncryptedPayload;
            } else {
                safeUnreachable(preset);
                return;
            }
        }) ?? [];

    const allSettled = await Promise.allSettled(result);
    return first(compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : null))));
}
