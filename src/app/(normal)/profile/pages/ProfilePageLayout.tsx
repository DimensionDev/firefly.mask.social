'use client';

import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import React, { type PropsWithChildren } from 'react';
import { useAccount as useEVMAccount } from 'wagmi';

import { Loading } from '@/components/Loading.js';
import { LoginRequiredGuard } from '@/components/LoginRequiredGuard.js';
import { ProfileInfo } from '@/components/Profile/ProfileInfo.js';
import { SourceTabs } from '@/components/SourceTabs.js';
import { Source } from '@/constants/enum.js';
import { FetchError } from '@/constants/error.js';
import { EMPTY_LIST, SORTED_PROFILE_SOURCES } from '@/constants/index.js';
import { isSameEthereumAddress, isSameSolanaAddress } from '@/helpers/isSameAddress.js';
import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { useUpdateCurrentVisitingProfile } from '@/hooks/useCurrentVisitingProfile.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';
import { getProfileById } from '@/services/getProfileById.js';

export function ProfilePageLayout({ identity, children }: PropsWithChildren<{ identity: FireflyIdentity }>) {
    const currentProfiles = useCurrentFireflyProfilesAll();
    const isCurrentProfile = currentProfiles.some((x) => isSameFireflyIdentity(x.identity, identity));
    const resolvedSource = narrowToSocialSource(identity.source);
    const isLogin = useIsLogin(resolvedSource);

    const evmAccount = useEVMAccount();
    const solanaWallet = useSolanaWallet();

    const { data: otherProfiles = EMPTY_LIST, isLoading } = useQuery({
        queryKey: ['all-profiles', identity.source, identity.id, evmAccount.address, solanaWallet.publicKey],
        queryFn: async () => {
            if (!identity.id) return EMPTY_LIST;
            const isTokenRequired =
                isSameEthereumAddress(evmAccount.address, identity.id) ||
                (!!solanaWallet.publicKey && isSameSolanaAddress(solanaWallet.publicKey.toBase58(), identity.id));
            return FireflyEndpointProvider.getAllPlatformProfileByIdentity(identity, isTokenRequired);
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

    useUpdateCurrentVisitingProfile(profile);

    if (isLoading && !isCurrentProfile) {
        return <Loading />;
    }

    const isSuspended = error instanceof FetchError && error.status === StatusCodes.FORBIDDEN;

    return (
        <>
            <SourceTabs
                source={identity.source}
                sources={SORTED_PROFILE_SOURCES.filter((value) => {
                    return profiles.find((profile) => profile.identity.source === value);
                })}
                href={(x) => {
                    const profile = profiles.find((profile) => profile.identity.source === x);
                    return resolveProfileUrl(x, profile?.identity.id ?? identity.id);
                }}
            />
            <LoginRequiredGuard source={identity.source}>
                {isLoading ? (
                    <Loading />
                ) : (
                    <ProfileInfo
                        profiles={profiles}
                        isSuspended={isSuspended}
                        isLoading={isLoadingProfile}
                        profile={profile}
                        identity={identity}
                    >
                        {children}
                    </ProfileInfo>
                )}
            </LoginRequiredGuard>
        </>
    );
}
