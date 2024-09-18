'use client';

import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { notFound } from 'next/navigation.js';
import { type PropsWithChildren, useEffect } from 'react';

import { Loading } from '@/components/Loading.js';
import { LoginRequiredGuard } from '@/components/LoginRequiredGuard.js';
import { ProfileInfo } from '@/components/Profile/ProfileInfo.js';
import { ProfileSourceTabs } from '@/components/Profile/ProfileSourceTabs.js';
import { Source } from '@/constants/enum.js';
import { FetchError } from '@/constants/error.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { useUpdateCurrentVisitingProfile } from '@/hooks/useCurrentVisitingProfile.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';
import { getProfileById } from '@/services/getProfileById.js';
import { useFireflyIdentityState } from '@/store/useFireflyIdentityStore.js';

export function ProfilePageLayout({ identity, children }: PropsWithChildren<{ identity: FireflyIdentity }>) {
    const { setIdentity } = useFireflyIdentityState();
    const currentProfiles = useCurrentFireflyProfilesAll();
    const isCurrentProfile = currentProfiles.some((x) => isSameFireflyIdentity(x.identity, identity));
    const resolvedSource = narrowToSocialSource(identity.source);
    const isLogin = useIsLogin(resolvedSource);

    const { data: otherProfiles = EMPTY_LIST, isLoading } = useQuery({
        queryKey: ['all-profiles', identity.source, identity.id],
        queryFn: async () => {
            if (!identity.id) return EMPTY_LIST;
            return FireflySocialMediaProvider.getAllPlatformProfileByIdentity(identity);
        },
    });

    const profiles = isCurrentProfile ? currentProfiles : otherProfiles;

    const {
        data: profile = null,
        isLoading: isLoadingProfile,
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

    useEffect(() => {
        setIdentity(identity);
    }, [identity, setIdentity]);

    useNavigatorTitle(t`Profile`);
    useUpdateCurrentVisitingProfile(profile);

    if (isLoading && !isCurrentProfile) {
        return <Loading />;
    }

    if (!identity) {
        notFound();
    }

    const isSuspended = error instanceof FetchError && error.status === StatusCodes.FORBIDDEN;

    return (
        <>
            <ProfileSourceTabs profiles={profiles} identity={identity} />
            <LoginRequiredGuard source={identity.source} className="!pt-0">
                {isLoading ? (
                    <Loading />
                ) : (
                    <ProfileInfo
                        profiles={profiles}
                        isSuspended={isSuspended}
                        isLoading={isLoadingProfile}
                        profile={profile}
                    >
                        {children}
                    </ProfileInfo>
                )}
            </LoginRequiredGuard>
        </>
    );
}
