'use client';

import { t } from '@lingui/macro';
import { isSameAddress } from '@masknet/web3-shared-base';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';
import { useMemo } from 'react';
import { useDocumentTitle } from 'usehooks-ts';

import { Loading } from '@/components/Loading.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { Info } from '@/components/Profile/Info.js';
import { ProfileSourceTabs } from '@/components/Profile/ProfileSourceTabs.js';
import { ProfileTabs } from '@/components/Profile/ProfileTabs.js';
import { Tabs } from '@/components/Profile/Tabs.js';
import { Title } from '@/components/Profile/Title.js';
import { WalletInfo } from '@/components/Profile/WalletInfo.js';
import { WalletTabs } from '@/components/Profile/WalletTabs.js';
import { Source } from '@/constants/enum.js';
import { EMPTY_LIST, SITE_NAME } from '@/constants/index.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { isMyProfile } from '@/helpers/isMyProfile.js';
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
    hiddenTitle?: boolean;
}

export function ProfilePage({ profiles, hiddenTitle }: ProfilePageProps) {
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();

    const { source, identity } = ProfileContext.useContainer();

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

    const info = useMemo(() => {
        if (source === Source.Wallet && walletProfile) {
            return <WalletInfo profile={walletProfile} relations={relations} />;
        }
        if (profile) {
            const isMyself = isMyProfile(
                profile.source,
                profile.source === Source.Lens ? profile.handle : profile.profileId,
            );

            return <Info profile={profile} isMyProfile={isMyself} source={profile.source} />;
        }

        return null;
    }, [profile, walletProfile, source, relations]);

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
        !profile &&
        !walletProfile &&
        !isLoading &&
        !(currentProfile?.source === Source.Twitter && !currentTwitterProfile)
    ) {
        notFound();
    }

    return (
        <div>
            {!hiddenTitle ? (
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
            {profiles.length > 1 ? <ProfileSourceTabs profiles={profiles} /> : null}
            {isLoading ? (
                <Loading />
            ) : source === Source.Twitter && !currentTwitterProfile?.profileId ? (
                <NotLoginFallback source={Source.Twitter} />
            ) : (
                <>
                    {info}
                    <ProfileTabs profiles={profiles.filter((x) => x.source === source)} />

                    {walletProfile ? (
                        <WalletTabs address={walletProfile.address} />
                    ) : profile ? (
                        <Tabs source={profile.source} profileId={profile.profileId} />
                    ) : null}
                </>
            )}
        </div>
    );
}
