import { ValueRef } from '@masknet/shared-base';
import { usePathname } from 'next/navigation.js';
import { useEffect, useMemo } from 'react';

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

    return useMemo(() => {
        const isPostPage = isRoutePathname(pathname, '/post');
        if (!isPostPage) return null;
        return currentVisitingPost.value;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, currentVisitingPost.value]);
}
