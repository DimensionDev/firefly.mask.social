'use client';

import { MaskProviders } from '@/components/MaskProviders.js';
import { Providers } from '@/components/Providers.js';
import { DecryptPost } from '@/mask/main/DecryptPost.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface PageInspectorProps {
    post?: Post;
    payload?: [string, '1' | '2'];
}

export default function DecryptedPost({ post, payload }: PageInspectorProps) {
    if (!post || !payload) return null;

    return (
        <Providers>
            <MaskProviders>
                <DecryptPost post={post} payload={payload} />
            </MaskProviders>
        </Providers>
    );
}
