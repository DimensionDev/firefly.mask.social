import { createIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import { ListInPage } from '@/components/ListInPage.js';
import { MutedUserItem } from '@/components/Profile/MutedUserItem.js';
import { ScrollListKey, type SocialSource } from "@/constants/enum.js";
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface MutedUsersProps {
    source: SocialSource
}

const getProfileItemContent = (index: number, profile: Profile, listKey: string) => {
    return <MutedUserItem profile={profile} key={`${listKey}-${index}`} />;
};

export function MutedUsers({ source }: MutedUsersProps) {
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['mute-list', source, 'user'],
        queryFn: async ({ pageParam }) => {
            const provider = resolveSocialMediaProvider(source);
            return provider.getBlockedUsers(createIndicator(undefined, pageParam));
        },
        initialPageParam: '1',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => data.pages.flatMap((x) => x.data),
    });

    return (
        <ListInPage
            key={source}
            queryResult={queryResult}
            className="no-scrollbar"
            VirtualListProps={{
                useWindowScroll: false,
                listKey: `${ScrollListKey.Profile}:muted`,
                computeItemKey: (index, profile) => `${profile.profileId}-${index}`,
                itemContent: (index, profile) =>
                    getProfileItemContent(index, profile, `${ScrollListKey.Profile}:muted`),
            }}
            NoResultsFallbackProps={{
                className: 'mt-20',
            }}
        />
    );
}
