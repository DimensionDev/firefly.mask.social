'use client';

import { useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { usePathname } from 'next/navigation.js';
import { memo, type PropsWithChildren } from 'react';

import { Loading } from '@/components/Loading.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { Info } from '@/components/Profile/Info.js';
import { ProfileNotFound } from '@/components/Profile/ProfileNotFound.js';
import { ProfileSourceTabs } from '@/components/Profile/ProfileSourceTabs.js';
import { ProfileTabs } from '@/components/Profile/ProfileTabs.js';
import { Title } from '@/components/Profile/Title.js';
import { ProfileDetailEffect } from '@/components/ProfileDetailEffect.js';
import { SuspendedAccountFallback } from '@/components/SuspendedAccountFallback.js';
import { SuspendedAccountInfo } from '@/components/SuspendedAccountInfo.js';
import { PageRoute, type SocialSource, Source } from '@/constants/enum.js';
import { FetchError } from '@/constants/error.js';
import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import type { FireflyIdentity, FireflyProfile } from '@/providers/types/Firefly.js';
import { getProfileById } from '@/services/getProfileById.js';
import { useTwitterStateStore } from '@/store/useProfileStore.js';

export const TwitterProfileInfo = memo<
    PropsWithChildren<{
        profiles: FireflyProfile[];
        identity: FireflyIdentity;
    }>
>(function TwitterProfileInfo({ identity, profiles, children }) {
    const currentProfiles = useCurrentFireflyProfilesAll();
    const isCurrentProfile = currentProfiles.some((x) => isSameFireflyIdentity(x.identity, identity));
    const resolvedSource = narrowToSocialSource(identity.source);
    const isLogin = useIsLogin(resolvedSource);

    const {
        data: profile = null,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['profile', identity.source, identity.id],
        queryFn: async () => {
            if (!identity.id || identity.source === Source.Wallet || (isCurrentProfile && !isLogin)) return null;
            return getProfileById(resolvedSource, identity.id);
        },
        retry(failureCount, error) {
            if (error instanceof FetchError && error.status === StatusCodes.FORBIDDEN) return false;
            return failureCount <= 3;
        },
    });

    const isSuspended = error instanceof FetchError && error.status === StatusCodes.FORBIDDEN;

    const pathname = usePathname();
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();

    const isOthersProfile = !currentProfiles.some((x) => isSameFireflyIdentity(x.identity, identity));
    const { source } = identity;

    const isFinalized = !isSuspended && !isLoading;

    const twitterProfile = isOthersProfile ? profile : currentTwitterProfile || profile;

    const profileMissing = !twitterProfile && !profiles.length;

    const profileNotFound = isFinalized && profileMissing;

    const showFallback =
        (!isOthersProfile && (!isLogin || profileNotFound)) || (profileNotFound && pathname === PageRoute.Profile);

    if (isLoading && !isCurrentProfile) {
        return <Loading />;
    }

    if (showFallback) {
        return <NotLoginFallback source={resolvedSource} className="!pt-0" />;
    }

    if (profileNotFound || !profile) {
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
            <ProfileSourceTabs profiles={profiles} identity={identity} />
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    {profile && !showFallback ? <Title profile={profile} profiles={profiles} /> : null}
                    <Info profile={profile} />
                    <ProfileTabs identity={identity} profiles={profiles.filter((x) => x.identity.source === source)} />
                    {children}
                    <ProfileDetailEffect profile={profile} identity={identity} />
                </>
            )}
        </>
    );
});
