import type { Post } from '@/providers/types/SocialMedia.js';

export function getEncryptedPayloadFromText(post: Post): [string, '1' | '2'] | undefined {
    const raw = post.metadata.content?.content;
    if (!raw) return;

    const matched = raw.match(/(?:.*)PostData_(v1|v2)=(.*)/);
    if (!matched) return;

    const [, version, payload] = matched;

    if (version === 'v1') return [payload, '1'];
    if (version === 'v2') return [payload, '2'];
    return;
}

export function getEncryptedPyloadFromImageAttachment(post: Post): [string, '1' | '2'] | undefined {
    console.log('DEBUG: getEncryptedPyloadFromImageAttachment()');
    console.log(post);

    return;
}
