import { ValueRef } from '@masknet/shared-base';
import { useValueRef } from '@masknet/shared-base-ui';
import { usePathname } from 'next/navigation.js';
import { useEffect } from 'react';

import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import type { Post } from '@/providers/types/SocialMedia.js';

const currentVisitingPost = new ValueRef<Post | null>(null);

export function useUpdateCurrentVisitingPost(post: Post | null) {
    useEffect(() => {
        currentVisitingPost.value = post;
    }, [post]);
}

export function useCurrentVisitingPost() {
    const pathname = usePathname();
    const isPostPage = isRoutePathname(pathname, '/post/:detail', true);
    const post = useValueRef(currentVisitingPost);
    return isPostPage ? post : null;
}
