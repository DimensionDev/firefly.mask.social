'use client';
import { safeUnreachable } from '@masknet/kit';

import { FollowersList } from '@/app/(normal)/profile/[id]/[category]/pages/FollowersList.js';
import { FollowingList } from '@/app/(normal)/profile/[id]/[category]/pages/FollowingList.js';
import { MutualFollowersList } from '@/app/(normal)/profile/[id]/[category]/pages/MutualFollowersList.js';
import { type SocialSourceInURL } from '@/constants/enum.js';
import { FollowCategory } from '@/types/social.js';

interface Props {
    params: {
        id: string;
        category: FollowCategory;
    };
    searchParams: { source: SocialSourceInURL };
}

export default function FollowPage({ params, searchParams }: Props) {
    switch (params.category) {
        case FollowCategory.Following:
            return <FollowingList profileId={params.id} source={searchParams.source} />;
        case FollowCategory.Followers:
            return <FollowersList profileId={params.id} source={searchParams.source} />;
        case FollowCategory.Mutuals:
            return <MutualFollowersList profileId={params.id} source={searchParams.source} />;
        default:
            safeUnreachable(params.category);
            return null;
    }
}
