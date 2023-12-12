'use client';
import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
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
import { type PlatformKeyword, resolvePlatform } from '@/helpers/resolvePlatform.js';
import { useIsMyProfile } from '@/hooks/isMyProfile.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';

interface ProfilePageProps {
    params: { id: string; platform: PlatformKeyword };
}
export default function ProfilePage({ params: { platform: _platform, id: handleOrProfileId } }: ProfilePageProps) {
    const platform = resolvePlatform(_platform);
    const isMyProfile = useIsMyProfile(platform, handleOrProfileId);

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile', handleOrProfileId, platform],
        queryFn: () => {
            switch (platform) {
                case SocialPlatform.Lens:
                    return LensSocialMediaProvider.getProfileByHandle(handleOrProfileId);
                case SocialPlatform.Farcaster:
                    return WarpcastSocialMediaProvider.getProfileById(handleOrProfileId);
                default:
                    safeUnreachable(platform);
                    return null;
            }
        },
    });

    const title = useMemo(() => {
        if (!profile) return '';
        const fragments = [profile.displayName];
        if (profile.handle) fragments.push(`(@${profile.handle})`);
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
