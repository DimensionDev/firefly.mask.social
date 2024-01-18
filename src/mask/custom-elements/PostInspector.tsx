'use client';

import dynamic from 'next/dynamic.js';

import { WidgetWithProps } from '@/mask/custom-elements/WidgetWithProps.js';
import type { Post } from '@/providers/types/SocialMedia.js';

// @ts-ignore
const PostInspector = dynamic(() => import('@/mask/widgets/PostInspector.js'), { ssr: false });

class Element extends WidgetWithProps<{
    post?: Post;
}> {
    constructor() {
        super(PostInspector);
    }
}

customElements.define('mask-post-inspector', Element);
