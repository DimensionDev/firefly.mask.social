import { createIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { MutedProfileItem } from '@/components/Profile/MutedProfileItem.js';
import { ScrollListKey, type SocialSource } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface MutedProfilesProps {
    source: SocialSource;
}

const getProfileItemContent = (index: number, profile: Profile, listKey: string) => {
    return <MutedProfileItem profile={profile} key={`${listKey}-${index}`} />;
};

export function MutedProfiles({ source }: MutedProfilesProps) {
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['profiles', source, 'muted-list'],
        queryFn: async ({ pageParam }) => {
            const provider = resolveSocialMediaProvider(source);
            return provider.getBlockedProfiles(createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
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
