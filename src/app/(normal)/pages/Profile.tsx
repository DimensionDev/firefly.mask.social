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
import { isSameAddress } from '@/helpers/isSameAddress.js';
import { isSameFireflyProfile } from '@/helpers/isSameProfile.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfile.js';
import { useUpdateCurrentVisitingProfile } from '@/hooks/useCurrentVisitingProfile.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { FireflyProfileContext } from '@/hooks/useProfileContext.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireFlyProfile, WalletProfile } from '@/providers/types/Firefly.js';
import { getProfileById } from '@/services/getProfileById.js';
import { useTwitterStateStore } from '@/store/useProfileStore.js';

interface ProfilePageProps {
    profiles: FireFlyProfile[];
}

export function ProfilePage({ profiles }: ProfilePageProps) {
    const { fireflyProfile } = FireflyProfileContext.useContainer();
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();

    const pathname = usePathname();
    const isProfilePage = pathname === PageRoute.Profile;

    const currentFireflyProfilesAll = useCurrentFireflyProfilesAll();
    const isMyProfile = !currentFireflyProfilesAll.some((x) => isSameFireflyProfile(x, fireflyProfile));

    const walletProfile =
        fireflyProfile.source === Source.Wallet
            ? (profiles.find((x) => x.source === Source.Wallet && isSameAddress(x.identity, fireflyProfile.source))
                  ?.__origin__ as WalletProfile)
            : undefined;

    const {
        data: profile = null,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['profile', fireflyProfile],
        queryFn: async () => {
            if (!fireflyProfile.identity || fireflyProfile.source === Source.Wallet) return null;
            // can't access the profile If not login Twitter.
            if (fireflyProfile.source === Source.Twitter && !currentTwitterProfile?.profileId) return null;
            const socialSource = narrowToSocialSource(fireflyProfile.source);

            return getProfileById(socialSource, fireflyProfile.identity);
        },
        retry(failureCount, error) {
            if (error instanceof FetchError && error.status === StatusCodes.FORBIDDEN) return false;
            return failureCount <= 3;
        },
    });

    const { data: relations } = useQuery({
        enabled: fireflyProfile.source === Source.Wallet,
        queryKey: ['relation', fireflyProfile],
        queryFn: async () => {
            if (fireflyProfile.source !== Source.Wallet || !fireflyProfile.identity) return EMPTY_LIST;

            return FireflySocialMediaProvider.getNextIDRelations('ethereum', fireflyProfile.identity);
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
        !isMyProfile &&
        !profile &&
        !walletProfile &&
        !isLoading &&
        (!(fireflyProfile.source === Source.Twitter && !currentTwitterProfile) || !profiles.length)
    ) {
        notFound();
    }

    return (
        <div>
            {isMyProfile && !isSuspended ? (
                <Title
                    profile={profile}
                    walletProfile={walletProfile}
                    isSingleProfile={profiles.length === 1}
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
                source={fireflyProfile.source}
                walletProfile={walletProfile}
                profile={profile}
                profiles={profiles}
                relations={relations}
                isSuspended={isSuspended}
            />
        </div>
    );
}
