'use client';

import dynamic from 'next/dynamic.js';

import { WidgetWithProps } from '@/mask/custom-elements/WidgetWithProps.js';
import type { Post } from '@/providers/types/SocialMedia.js';

// @ts-ignore
const DecryptedPost = dynamic(() => import('@/mask/widgets/DecryptedPost.js'), { ssr: false });

class Element extends WidgetWithProps<{
    post: Post;
    payload: [string, '1' | '2'];
}> {
    constructor() {
        super(DecryptedPost);
    }
}

customElements.define('mask-decrypted-post', Element);
