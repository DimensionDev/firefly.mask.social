'use client';

import { t } from '@lingui/macro';
import { EMPTY_LIST } from '@masknet/shared-base';
import { isSameAddress } from '@masknet/web3-shared-base';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
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
import { SITE_NAME } from '@/constants/index.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { useUpdateCurrentVisitingProfile } from '@/hooks/useCurrentVisitingProfile.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { ProfileContext } from '@/hooks/useProfileContext.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireFlyProfile, WalletProfile } from '@/providers/types/Firefly.js';
import { getProfileById } from '@/services/getProfileById.js';
import { useTwitterStateStore } from '@/store/useProfileStore.js';

interface ProfilePageProps {
    profiles: FireFlyProfile[];
}

export function ProfilePage({ profiles }: ProfilePageProps) {
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();
    const { source, identity } = ProfileContext.useContainer();

    const pathname = usePathname();
    const isOtherProfile = pathname !== PageRoute.Profile && isRoutePathname(pathname, PageRoute.Profile);

    const walletProfile = useMemo(() => {
        return source === Source.Wallet
            ? (profiles.find((x) => x.source === Source.Wallet && isSameAddress(x.identity, identity))?.__origin__ as
                  | WalletProfile
                  | undefined)
            : undefined;
    }, [source, profiles, identity]);

    const {
        data: profile = null,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['profile', source, identity],
        queryFn: async () => {
            if (!identity || source === Source.Wallet) return null;
            // can't access the profile If not login Twitter.
            if (source === Source.Twitter && !currentTwitterProfile?.profileId) return null;
            const socialSource = narrowToSocialSource(source);

            return getProfileById(socialSource, identity);
        },
        retry(failureCount, error) {
            if (error instanceof FetchError && error.status === StatusCodes.FORBIDDEN) return false;
            return failureCount <= 3;
        },
    });

    const { data: relations } = useQuery({
        enabled: source === Source.Wallet,
        queryKey: ['relation', identity, source],
        queryFn: async () => {
            if (source !== Source.Wallet || !identity) return EMPTY_LIST;

            return FireflySocialMediaProvider.getNextIDRelations('ethereum', identity);
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
        isOtherProfile &&
        !profile &&
        !walletProfile &&
        !isLoading &&
        (!(source === Source.Twitter && !currentTwitterProfile) || !profiles.length)
    ) {
        notFound();
    }

    return (
        <div>
            {isOtherProfile && !isSuspended ? (
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
            {profiles.length > 1 || pathname === PageRoute.Profile ? <ProfileSourceTabs profiles={profiles} /> : null}
            <ProfileContent
                loading={isLoading}
                source={source}
                walletProfile={walletProfile}
                profile={profile}
                profiles={profiles}
                relations={relations}
                isSuspended={isSuspended}
            />
        </div>
    );
}
