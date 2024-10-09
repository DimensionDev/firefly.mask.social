'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation.js';
import { memo, type PropsWithChildren, useMemo } from 'react';

import { Loading } from '@/components/Loading.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { Info } from '@/components/Profile/Info.js';
import { ProfileNotFound } from '@/components/Profile/ProfileNotFound.js';
import { ProfileTabs } from '@/components/Profile/ProfileTabs.js';
import { Title } from '@/components/Profile/Title.js';
import { WalletInfo } from '@/components/Profile/WalletInfo.js';
import { SuspendedAccountFallback } from '@/components/SuspendedAccountFallback.js';
import { SuspendedAccountInfo } from '@/components/SuspendedAccountInfo.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveFireflyProfiles } from '@/helpers/resolveFireflyProfiles.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireflyIdentity, FireflyProfile } from '@/providers/types/Firefly.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useTwitterStateStore } from '@/store/useProfileStore.js';

export const ProfileInfo = memo<
    PropsWithChildren<{
        profiles: FireflyProfile[];
        isLoading?: boolean;
        isSuspended?: boolean;
        profile?: Profile | null;
        identity: FireflyIdentity;
    }>
>(function ProfileInfo({ identity, profiles, children, isLoading = false, profile = null, isSuspended }) {
    const resolvedSource = narrowToSocialSource(identity.source);
    const { walletProfile } = useMemo(() => resolveFireflyProfiles(identity, profiles), [identity, profiles]);

    const pathname = usePathname();
    const currentProfiles = useCurrentFireflyProfilesAll();
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();

    const isLogin = useIsLogin(resolvedSource);
    const isOthersProfile = !currentProfiles.some((x) => isSameFireflyIdentity(x.identity, identity));
    const { source, id } = identity;

    const { data: relations = EMPTY_LIST } = useQuery({
        enabled: source === Source.Wallet,
        queryKey: ['relation', source, id],
        queryFn: async () => {
            if (source !== Source.Wallet || !id) return EMPTY_LIST;
            return FireflySocialMediaProvider.getNextIDRelations('ethereum', id);
        },
    });

    const isFinalized = !isSuspended && !isLoading;

    const twitterProfile = isOthersProfile ? profile : currentTwitterProfile || profile;
    const profileMissing =
        !profile && !walletProfile && ((identity.source === Source.Twitter && !twitterProfile) || !profiles.length);

    const profileNotFound = isFinalized && profileMissing;

    const showFallback =
        identity.source !== Source.Wallet &&
        ((!isOthersProfile && (!isLogin || profileNotFound)) || (profileNotFound && pathname === '/profile'));

    if (isLoading && source !== Source.Twitter) {
        return <Loading />;
    }

    if (showFallback) {
        return <NotLoginFallback source={resolvedSource} className="!pt-0" />;
    }

    if (profileNotFound) {
        return <ProfileNotFound />;
    }

    if (isSuspended) {
        return (
            <>
                <SuspendedAccountInfo source={source as SocialSource} />
                <SuspendedAccountFallback />
            </>
        );
    }

    return (
        <>
            {(profile || walletProfile) && !showFallback ? (
                <Title profile={profile} profiles={profiles} isOthersProfile={isOthersProfile} />
            ) : null}
            {source === Source.Wallet && walletProfile ? (
                <WalletInfo profile={walletProfile} relations={relations} />
            ) : profile ? (
                <Info profile={profile} />
            ) : null}
            <ProfileTabs identity={identity} profiles={profiles.filter((x) => x.identity.source === source)} />
            {children}
        </>
    );
});
