import { usePathname } from 'next/navigation.js';
import { useEffect } from 'react';

import { PageRoute } from '@/constants/enum.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useValueRef } from '@/hooks/useValueRef.js';
import { ValueRef } from '@/libs/ValueRef.js';
import type { Post } from '@/providers/types/SocialMedia.js';

const currentVisitingPost = new ValueRef<Post | null>(null);

export function useUpdateCurrentVisitingPost(post: Post | null) {
    useEffect(() => {
        currentVisitingPost.value = post;
    }, [post]);
}

export function useCurrentVisitingPost() {
    const pathname = usePathname();
    const isPostPage = isRoutePathname(pathname, PageRoute.PostDetail, true);
    const post = useValueRef(currentVisitingPost);
    return isPostPage ? post : null;
}
