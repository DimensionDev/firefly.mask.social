'use client';

import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme';

import { Providers } from '@/components/Provider.js';
import { DecryptPost } from '@/mask/main/DecryptPost.js';
import { Providers as MaskProviders } from '@/mask/widgets/Providers.js';
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
                <DisableShadowRootContext.Provider value={false}>
                    <ShadowRootIsolation>
                        <DecryptPost post={post} payload={payload} />
                    </ShadowRootIsolation>
                </DisableShadowRootContext.Provider>
            </MaskProviders>
        </Providers>
    );
}
