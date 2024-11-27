'use client';

import { Providers } from '@/components/Providers.js';
import { MaskProviders } from '@/mask/components/MaskProviders.js';
import { PostInspector as MaskPost } from '@/mask/widgets/components/PostInspector.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface PostInspectorProps {
    post?: Post;
}

export default function PostInspector({ post }: PostInspectorProps) {
    if (!post) return null;
    return (
        <Providers>
            <MaskProviders>
                <MaskPost post={post} />
            </MaskProviders>
        </Providers>
    );
}
