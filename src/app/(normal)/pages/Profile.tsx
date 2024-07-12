'use client';

import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { notFound, usePathname } from 'next/navigation.js';
import { useMemo } from 'react';
import { useDocumentTitle } from 'usehooks-ts';

import { Loading } from '@/components/Loading.js';
import { ProfileContent } from '@/components/Profile/ProfileContent.js';
import { ProfileSourceTabs } from '@/components/Profile/ProfileSourceTabs.js';
import { Title } from '@/components/Profile/Title.js';
import { PageRoute, Source } from '@/constants/enum.js';
import { FetchError } from '@/constants/error.js';
import { EMPTY_LIST, SITE_NAME } from '@/constants/index.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { resolveFireflyProfiles } from '@/helpers/resolveFireflyProfiles.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { useUpdateCurrentVisitingProfile } from '@/hooks/useCurrentVisitingProfile.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { ProfileTabContext } from '@/hooks/useProfileTabContext.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireflyProfile } from '@/providers/types/Firefly.js';
import { getProfileById } from '@/services/getProfileById.js';
import { useTwitterStateStore } from '@/store/useProfileStore.js';

interface ProfilePageProps {
    profiles: FireflyProfile[];
}

export function ProfilePage({ profiles }: ProfilePageProps) {
    const { profileTab } = ProfileTabContext.useContainer();
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();

    const pathname = usePathname();
    const isProfilePage = pathname === PageRoute.Profile;

    const currentProfiles = useCurrentFireflyProfilesAll();
    const isOthersProfile = !currentProfiles.some(
        (x) => x.source === profileTab.source && x.identity === profileTab.identity,
    );

    const { socialProfile, walletProfile } = resolveFireflyProfiles(profileTab, profiles);

    const {
        data: profile = null,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['profile', socialProfile?.source, socialProfile?.identity],
        queryFn: async () => {
            if (!socialProfile) return null;
            // only current twitter profile is allowed
            if (socialProfile.source === Source.Twitter && !currentTwitterProfile?.profileId) return null;
            return getProfileById(narrowToSocialSource(socialProfile.source), socialProfile.identity);
        },
        retry(failureCount, error) {
            if (error instanceof FetchError && error.status === StatusCodes.FORBIDDEN) return false;
            return failureCount <= 3;
        },
    });

    const { data: relations = EMPTY_LIST } = useQuery({
        enabled: !!walletProfile,
        queryKey: ['relation', walletProfile],
        queryFn: async () => {
            if (!walletProfile) return EMPTY_LIST;
            return FireflySocialMediaProvider.getNextIDRelations('ethereum', walletProfile.address);
        },
    });

    const title = useMemo(() => {
        if (!profile) return SITE_NAME;
        const fragments = [profile.displayName];
        if (profile.handle) fragments.push(`(@${profile.handle})`);
        return createPageTitle(fragments.join(' '));
    }, [profile]);

    useDocumentTitle(title);
    useNavigatorTitle(t`Profile`);
    useUpdateCurrentVisitingProfile(profile);

    const isSuspended = error instanceof FetchError && error.status === StatusCodes.FORBIDDEN;

    if (
        !isSuspended &&
        !isOthersProfile &&
        !profile &&
        !walletProfile &&
        !isLoading &&
        (!(profileTab.source === Source.Twitter && !currentTwitterProfile) || !profiles.length)
    ) {
        notFound();
    }

    return (
        <div>
            {!isSuspended ? <Title profile={profile} profiles={profiles} isOthersProfile={isOthersProfile} /> : null}
            {profiles.length > 1 || isProfilePage ? <ProfileSourceTabs profiles={profiles} /> : null}
            {isLoading ? (
                <Loading />
            ) : (
                <ProfileContent profile={profile} profiles={profiles} relations={relations} isSuspended={isSuspended} />
            )}
        </div>
    );
}
