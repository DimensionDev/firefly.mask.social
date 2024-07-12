'use client';

import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { notFound, usePathname } from 'next/navigation.js';
import { useMemo } from 'react';
import { useDocumentTitle } from 'usehooks-ts';

import { ProfileContent } from '@/components/Profile/ProfileContent.js';
import { ProfileSourceTabs } from '@/components/Profile/ProfileSourceTabs.js';
import { Title } from '@/components/Profile/Title.js';
import { PageRoute, Source } from '@/constants/enum.js';
import { FetchError } from '@/constants/error.js';
import { EMPTY_LIST, SITE_NAME } from '@/constants/index.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { resolveFireflyProfiles } from '@/helpers/resolveFireflyProfiles.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { useUpdateCurrentVisitingProfile } from '@/hooks/useCurrentVisitingProfile.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { ProfileTabContext } from '@/hooks/useProfileTabContext.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { getProfileById } from '@/services/getProfileById.js';
import { useTwitterStateStore } from '@/store/useProfileStore.js';

export function ProfilePage() {
    const { profileTab } = ProfileTabContext.useContainer();
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();

    const pathname = usePathname();
    const isProfilePage = pathname === PageRoute.Profile;

    const profiles = useCurrentFireflyProfilesAll(profileTab);
    const { socialProfile, walletProfile } = resolveFireflyProfiles(profileTab, profiles);

    const {
        data: profile = null,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['profile', profileTab],
        queryFn: async () => {
            if (!profileTab.identity || profileTab.source === Source.Wallet) return null;
            // can't access the profile If not login Twitter.
            if (profileTab.source === Source.Twitter && !currentTwitterProfile?.profileId) return null;
            const socialSource = narrowToSocialSource(profileTab.source);
            return getProfileById(socialSource, profileTab.identity);
        },
        retry(failureCount, error) {
            if (error instanceof FetchError && error.status === StatusCodes.FORBIDDEN) return false;
            return failureCount <= 3;
        },
    });

    const { data: relations } = useQuery({
        enabled: profileTab.source === Source.Wallet,
        queryKey: ['relation', profileTab],
        queryFn: async () => {
            if (profileTab.source !== Source.Wallet || !profileTab.identity) return EMPTY_LIST;
            return FireflySocialMediaProvider.getNextIDRelations('ethereum', profileTab.identity);
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
        !socialProfile &&
        !profile &&
        !walletProfile &&
        !isLoading &&
        (!(profileTab.source === Source.Twitter && !currentTwitterProfile) || !profiles.length)
    ) {
        notFound();
    }

    return (
        <div>
            {!isSuspended ? (
                <Title
                    profile={profile}
                    walletProfile={walletProfile}
                    isSingleProfile={profiles.length === 1}
                    isOtherProfile={!socialProfile}
                    displayName={
                        walletProfile
                            ? walletProfile.primary_ens ?? formatEthereumAddress(walletProfile.address, 4)
                            : profile?.displayName
                    }
                />
            ) : null}
            {profiles.length > 1 || isProfilePage ? <ProfileSourceTabs profiles={profiles} /> : null}
            <ProfileContent
                loading={isLoading}
                source={profileTab.source}
                profile={profile}
                walletProfile={walletProfile}
                profiles={profiles}
                relations={relations}
                isSuspended={isSuspended}
            />
        </div>
    );
}
