import { EMPTY_LIST, type Pageable, type PageIndicator } from '@masknet/shared-base';
import type { InfiniteData } from '@tanstack/react-query';
import { uniqBy } from 'lodash-es';

import type { SocialPlatform } from '@/constants/enum.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { mergeThreadPosts } from '@/helpers/mergeThreadPosts.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useBlockedChannelStore } from '@/store/useBlockedChannelStore.js';

export function getPostsSelector(source: SocialPlatform) {
    return (data: InfiniteData<Pageable<Post, PageIndicator | undefined> | undefined, string>) => {
        const currentProfile = getCurrentProfile(source);
        const { allBlockedChannels } = useBlockedChannelStore.getState();
        const muted = currentProfile
            ? allBlockedChannels[`${currentProfile.source}:${currentProfile.profileId}`] ?? EMPTY_LIST
            : EMPTY_LIST;
        const result =
            uniqBy(
                data.pages.flatMap((x) => x?.data || EMPTY_LIST),
                (post) => {
                    if (!post.mirrors?.length) return `${post.postId}:mirror`;
                    return post.postId;
                },
            ) || EMPTY_LIST;

        return mergeThreadPosts(source, result).filter((x) => (x.channel ? !muted.includes(x.channel.id) : true));
    };
}
