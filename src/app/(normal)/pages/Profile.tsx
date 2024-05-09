'use client';

import { t } from '@lingui/macro';
import { isSameAddress } from '@masknet/web3-shared-base';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';
import { notFound, usePathname } from 'next/navigation.js';
import { useMemo } from 'react';
import { useDocumentTitle } from 'usehooks-ts';

import { ProfileContent } from '@/components/Profile/ProfileContent.js';
import { ProfileSourceTabs } from '@/components/Profile/ProfileSourceTabs.js';
import { Title } from '@/components/Profile/Title.js';
import { PageRoute, Source } from '@/constants/enum.js';
import { EMPTY_LIST, SITE_NAME } from '@/constants/index.js';
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

    const currentProfile = profiles.find((x) => {
        if (source === Source.Wallet) return isSameAddress(identity, x.identity);
        return x.identity.toLowerCase() === identity?.toLowerCase();
    });

    const walletProfile = useMemo(() => {
        return currentProfile?.source === Source.Wallet ? (currentProfile?.__origin__ as WalletProfile) : undefined;
    }, [currentProfile]);

    const { data: profile = null, isLoading } = useQuery({
        queryKey: ['profile', source, currentProfile?.identity],
        queryFn: async () => {
            if (!currentProfile || currentProfile.source === Source.Wallet) return null;
            // can't access the profile If not login Twitter.
            if (currentProfile.source === Source.Twitter && !currentTwitterProfile?.profileId) return null;
            const socialSource = narrowToSocialSource(currentProfile.source);

            return getProfileById(socialSource, currentProfile.identity);
        },
    });

    const { data: relations } = useQuery({
        enabled: currentProfile?.source === Source.Wallet,
        queryKey: ['relation', identity, currentProfile],
        queryFn: async () => {
            if (currentProfile?.source !== Source.Wallet || !identity) return EMPTY_LIST;

            return FireflySocialMediaProvider.getNextIDRelations('ethereum', currentProfile.identity);
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

    if (
        isOtherProfile &&
        !profile &&
        !walletProfile &&
        !isLoading &&
        !(currentProfile?.source === Source.Twitter && !currentTwitterProfile)
    ) {
        notFound();
    }

    return (
        <div>
            {isOtherProfile ? (
                <Title
                    profile={profile}
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
            />
        </div>
    );
}
