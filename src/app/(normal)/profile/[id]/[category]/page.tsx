import type { Metadata } from 'next';

import { FollowersList } from '@/app/(normal)/profile/[id]/pages/FollowersList.js';
import { FollowingList } from '@/app/(normal)/profile/[id]/pages/FollowingList.js';
import { MutualFollowersList } from '@/app/(normal)/profile/[id]/pages/MutualFollowersList.js';
import { ProfilePageTimeline } from '@/components/Profile/ProfilePageTimeline.js';
import { FollowCategory, KeyType, type ProfileCategory, type SocialSourceInURL } from '@/constants/enum.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isSocialSourceInURL } from '@/helpers/isSocialSource.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { resolveSource } from '@/helpers/resolveSource.js';
import { getProfileOGById } from '@/services/getProfileOGById.js';

interface Props {
    params: {
        id: string;
        category: ProfileCategory;
    };
    searchParams: { source: SocialSourceInURL };
}

const getProfileOGByIdRedis = memoizeWithRedis(getProfileOGById, {
    key: KeyType.GetProfileOGById,
});

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    if (isSocialSourceInURL(searchParams.source)) {
        return getProfileOGByIdRedis(searchParams.source, params.id);
    }
    return createSiteMetadata();
}

export default function Page({ params, searchParams }: Props) {
    switch (params.category) {
        case FollowCategory.Following:
            return <FollowingList profileId={params.id} source={searchParams.source} />;
        case FollowCategory.Followers:
            return <FollowersList profileId={params.id} source={searchParams.source} />;
        case FollowCategory.Mutuals:
            return <MutualFollowersList profileId={params.id} source={searchParams.source} />;
        default:
            return <ProfilePageTimeline identity={{ id: params.id, source: resolveSource(searchParams.source) }} />;
    }
}
