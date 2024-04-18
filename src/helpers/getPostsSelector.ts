import type { Pageable, PageIndicator } from '@masknet/shared-base';
import type { InfiniteData } from '@tanstack/react-query';
import { uniqBy } from 'lodash-es';

import type { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { mergeThreadPosts } from '@/helpers/mergeThreadPosts.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function getPostsSelector(source: SocialPlatform) {
    return (data: InfiniteData<Pageable<Post, PageIndicator | undefined> | undefined, string>) => {
        const result =
            uniqBy(
                data.pages.flatMap((x) => x?.data || []),
                (post) => post.postId,
            ) || EMPTY_LIST;

        return mergeThreadPosts(source, result);
    };
}
