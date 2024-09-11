'use client';

import { FollowersList } from '@/app/(normal)/profile/[source]/[id]/pages/FollowersList.js';
import { FollowingList } from '@/app/(normal)/profile/[source]/[id]/pages/FollowingList.js';
import { MutualFollowersList } from '@/app/(normal)/profile/[source]/[id]/pages/MutualFollowersList.js';
import { ProfilePageTimeline } from '@/components/Profile/ProfilePageTimeline.js';
import { FollowCategory } from '@/constants/enum.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { ProfilePageContext } from '@/hooks/useProfilePageContext.js';

export function ProfileCategoryPage() {
    const { identity, category } = ProfilePageContext.useContainer();
    if (!category || !identity) return null;
    switch (category) {
        case FollowCategory.Following:
            return <FollowingList profileId={identity.id} source={narrowToSocialSource(identity.source)} />;
        case FollowCategory.Followers:
            return <FollowersList profileId={identity.id} source={narrowToSocialSource(identity.source)} />;
        case FollowCategory.Mutuals:
            return <MutualFollowersList profileId={identity.id} source={narrowToSocialSource(identity.source)} />;
        default:
            return <ProfilePageTimeline category={category} identity={identity} />;
    }
}
