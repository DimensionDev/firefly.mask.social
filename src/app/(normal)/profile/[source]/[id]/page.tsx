'use client';

import { safeUnreachable } from '@masknet/kit';
import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';
import { useMemo } from 'react';
import { useDocumentTitle } from 'usehooks-ts';

import Loading from '@/components/Loading.js';
import ContentTabs from '@/components/Profile/ContentTabs.js';
import Info from '@/components/Profile/Info.js';
import Title from '@/components/Profile/Title.js';
import { SocialPlatform } from '@/constants/enum.js';
import { SITE_NAME } from '@/constants/index.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { resolveSource, type SourceInURL } from '@/helpers/resolveSource.js';
import { useIsMyProfile } from '@/hooks/useIsMyProfile.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';

interface ProfilePageProps {
    params: {
        id: string;
        source: SourceInURL;
    };
}
export default function ProfilePage({ params: { source: _source, id: handleOrProfileId } }: ProfilePageProps) {
    const currentSource = resolveSource(_source);
    const isMyProfile = useIsMyProfile(currentSource, handleOrProfileId);

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile', currentSource, handleOrProfileId],
        queryFn: () => {
            switch (currentSource) {
                case SocialPlatform.Lens:
                    return LensSocialMediaProvider.getProfileByHandle(handleOrProfileId);
                case SocialPlatform.Farcaster:
                    return FarcasterSocialMediaProvider.getProfileById(handleOrProfileId);
                default:
                    safeUnreachable(currentSource);
                    return null;
            }
        },
    });

    const title = useMemo(() => {
        if (!profile) return SITE_NAME;
        const fragments = [profile.displayName];
        if (profile.handle) fragments.push(`(@${profile.handle})`);
        return createPageTitle(fragments.join(' '));
    }, [profile]);

    useDocumentTitle(title);

    if (isLoading) {
        return <Loading />;
    }

    if (!profile) {
        notFound();
    }

    return (
        <div>
            {!isMyProfile ? <Title profile={profile} /> : null}

            <Info profile={profile} isMyProfile={isMyProfile} source={currentSource} />

            <ContentTabs source={profile.source} profileId={profile.profileId} />
        </div>
    );
}
