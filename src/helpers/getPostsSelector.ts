import { EMPTY_LIST, type Pageable, type PageIndicator } from '@masknet/shared-base';
import type { InfiniteData } from '@tanstack/react-query';
import { uniqBy } from 'lodash-es';

import type { SocialSource } from '@/constants/enum.js';
import { mergeThreadPosts } from '@/helpers/mergeThreadPosts.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function getPostsSelector(source: SocialSource) {
    return (data: InfiniteData<Pageable<Post, PageIndicator | undefined> | undefined, string>) => {
        const result =
            uniqBy(
                data.pages.flatMap((x) => x?.data || EMPTY_LIST),
                (post) => {
                    if (post.mirrors?.length || post.type === 'Mirror') return `${post.postId}:mirror`;
                    return post.postId;
                },
            ) || EMPTY_LIST;

        return mergeThreadPosts(source, result);
    };
}
