'use client';

import { MaskProviders } from '@/components/MaskProviders.js';
import { Providers } from '@/components/Providers.js';
import type { EncryptedPayload } from '@/helpers/getEncryptedPayload.js';
import { DecryptedPost } from '@/mask/widgets/components/DecryptedPost.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface DecryptedInspectorProps {
    post?: Post;
    payloadFromText?: EncryptedPayload;
    payloadFromImageAttachment?: EncryptedPayload;
}

export default function DecryptedInspector({
    post,
    payloadFromText,
    payloadFromImageAttachment,
}: DecryptedInspectorProps) {
    const payload = payloadFromImageAttachment ?? payloadFromText;

    if (!post || !payload) return null;

    return (
        <Providers>
            <MaskProviders>
                <DecryptedPost post={post} payload={payload} />
            </MaskProviders>
        </Providers>
    );
}
