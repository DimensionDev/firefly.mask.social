'use client';


import { Providers } from '@/app/provider.js';
import { DecryptPost } from '@/components/Posts/DecryptPost.jsx';
import { Providers as MaskProviders } from '@/mask/widgets/Providers.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface PageInspectorProps {
    post: Post;
    payload: [string, '1' | '2'];
}

export default function PageInspector({post, payload} : PageInspectorProps) {
    return (
        <Providers>
            <MaskProviders>
                <DecryptPost  post={post} payload={payload}/>
            </MaskProviders>
        </Providers>
    );
}
