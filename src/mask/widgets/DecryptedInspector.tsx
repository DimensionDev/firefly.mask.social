'use client';

import { MaskProviders } from '@/components/MaskProviders.js';
import { Providers } from '@/components/Providers.js';
import { DecryptedPost } from '@/mask/widgets/components/DecryptedPost.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface DecryptedInspectorProps {
    post?: Post;
    payload?: [string, '1' | '2'];
}

export default function DecryptedInspector({ post, payload }: DecryptedInspectorProps) {
    if (!post || !payload) return null;

    return (
        <Providers>
            <MaskProviders>
                <DecryptedPost post={post} payload={payload} />
            </MaskProviders>
        </Providers>
    );
}
