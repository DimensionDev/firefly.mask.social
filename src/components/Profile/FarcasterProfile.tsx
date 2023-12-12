import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useDocumentTitle } from 'usehooks-ts';

import Loading from '@/components/Loading.js';
import NotFoundFallback from '@/components/NotFoundFallback.js';
import ContentTabs from '@/components/Profile/ContentTabs.js';
import Info from '@/components/Profile/Info.js';
import Title from '@/components/Profile/Title.js';
import { SocialPlatform } from '@/constants/enum.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';

interface FarcasterProfileProps {
    id: string;
}
export default function FarcasterProfile({ id }: FarcasterProfileProps) {
    const { data: profile, isLoading } = useQuery({
        queryKey: ['farcaster-profile', id],
        queryFn: () => WarpcastSocialMediaProvider.getProfileById(id),
    });

    const currentProfile = useCurrentProfile(SocialPlatform.Farcaster);
    const isMyProfile = useMemo(() => !!currentProfile && currentProfile?.profileId === id, [id, currentProfile]);

    const title = useMemo(() => {
        if (!profile) return '';
        const fragments = [profile.displayName];
        if (profile.profileId) fragments.push(`(@${profile.profileId})`);
        return createPageTitle(fragments.join(' '));
    }, [profile]);

    useDocumentTitle(title);

    if (isLoading) {
        return <Loading />;
    }

    if (!profile) {
        return (
            <NotFoundFallback>
                <Trans>This profile does not exist</Trans>
            </NotFoundFallback>
        );
    }

    return (
        <div>
            {!isMyProfile ? <Title profile={profile} isMyProfile={isMyProfile} /> : null}

            <Info profile={profile} isMyProfile={isMyProfile} />

            <ContentTabs profileId={profile.profileId} />
        </div>
    );
}
