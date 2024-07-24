'use client';

import dynamic from 'next/dynamic.js';

import type { EncryptedPayload } from '@/helpers/getEncryptedPayload.js';
import { WidgetWithProps } from '@/mask/custom-elements/WidgetWithProps.js';
import type { Post } from '@/providers/types/SocialMedia.js';

// @ts-ignore
const DecryptedPost = dynamic(() => import('@/mask/widgets/DecryptedInspector.js'), { ssr: false });

class Element extends WidgetWithProps<{
    post?: Post;
    payloads?: EncryptedPayload[];
}> {
    constructor() {
        super(DecryptedPost);
    }
}

customElements.define('mask-decrypted-post', Element);
