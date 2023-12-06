'use client';

import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme';

import { DecryptPost } from '@/components/Posts/DecryptPost.js';
import { Providers } from '@/components/Provider.js';
import { Providers as MaskProviders } from '@/mask/widgets/Providers.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface PageInspectorProps {
    post?: Post;
    payload?: [string, '1' | '2'];
    canShowMore?: boolean;
}

export default function DecryptedPost({ post, payload, canShowMore = false }: PageInspectorProps) {
    if (!post || !payload) return null;

    return (
        <DisableShadowRootContext.Provider value={false}>
            <ShadowRootIsolation>
                <Providers>
                    <MaskProviders>
                        <DecryptPost post={post} payload={payload} />
                    </MaskProviders>
                </Providers>
            </ShadowRootIsolation>
        </DisableShadowRootContext.Provider>
    );
}
