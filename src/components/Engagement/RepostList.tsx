import { createIndicator } from '@/helpers/pageable.js';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import type { PostEngagementListProps } from '@/components/Engagement/type.js';
import { ListInPage } from '@/components/ListInPage.js';
import { ProfileInList } from '@/components/ProfileInList.js';
import { ScrollListKey } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

function getRepostReactorContent(index: number, profile: Profile, listKey: string) {
    return <ProfileInList key={profile.profileId} profile={profile} index={index} listKey={listKey} />;
}

/**
 * Including Reposts, Recasts, Mirrors
 */
export function RepostList({ postId, type, source }: PostEngagementListProps) {
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['profiles', source, 'engagements', type, postId],
        queryFn: async ({ pageParam }) => {
            const provider = resolveSocialMediaProvider(source);
            return provider.getRepostReactors(postId, createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => {
            if (lastPage?.data.length === 0) return;
            return lastPage?.nextIndicator?.id;
        },
        select(data) {
            return data.pages.flatMap((x) => x.data);
        },
    });
    const listKey = `${ScrollListKey.Engagement}:${postId}:${type}`;
    return (
        <ListInPage
            key={type}
            queryResult={queryResult}
            VirtualListProps={{
                listKey,
                computeItemKey: (index, like) => `${like.profileId}-${index}`,
                itemContent: (index, profile) => {
                    return getRepostReactorContent(index, profile, listKey);
                },
            }}
            NoResultsFallbackProps={{
                className: 'mt-20',
            }}
        />
    );
}
