'use client';

import { MaskProviders } from '@/components/MaskProviders.js';
import { Providers } from '@/components/Providers.jsx';
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
