'use client';

import { ClientProviders } from '@/components/ClientProviders.js';
import { MaskProviders } from '@/components/MaskProviders.js';
import { PostInspector as MaskPost } from '@/mask/widgets/components/PostInspector.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface PostInspectorProps {
    post?: Post;
}

export default function PostInspector({ post }: PostInspectorProps) {
    if (!post) return null;
    return (
        <ClientProviders>
            <MaskProviders>
                <MaskPost post={post} />
            </MaskProviders>
        </ClientProviders>
    );
}
