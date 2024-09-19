import { notFound } from 'next/navigation.js';

import { FollowersList } from '@/app/(normal)/profile/pages/FollowersList.js';
import { FollowingList } from '@/app/(normal)/profile/pages/FollowingList.js';
import { MutualFollowersList } from '@/app/(normal)/profile/pages/MutualFollowersList.js';
import { FollowCategory, type ProfileCategory, SourceInURL } from '@/constants/enum.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';

export default function Page({
    params,
}: {
    params: {
        id: string;
        category: ProfileCategory;
        source: SourceInURL;
    };
}) {
    const source = resolveSourceFromUrl(params.source);
    const identity = { source, id: params.id };
    if (!params.category || !identity) return null;
    switch (params.category) {
        case FollowCategory.Following:
            return <FollowingList profileId={identity.id} source={narrowToSocialSource(identity.source)} />;
        case FollowCategory.Followers:
            return <FollowersList profileId={identity.id} source={narrowToSocialSource(identity.source)} />;
        case FollowCategory.Mutuals:
            return <MutualFollowersList profileId={identity.id} source={narrowToSocialSource(identity.source)} />;
        default:
            notFound();
    }
}
