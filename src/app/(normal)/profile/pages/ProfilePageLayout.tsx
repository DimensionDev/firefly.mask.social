import { StatusCodes } from 'http-status-codes';
import React, { type PropsWithChildren } from 'react';

import { NoSSR } from '@/components/NoSSR.js';
import { Info } from '@/components/Profile/Info.js';
import { ProfileNotFound } from '@/components/Profile/ProfileNotFound.js';
import { ProfileSourceTabs } from '@/components/Profile/ProfileSourceTabs.js';
import { ProfileTabs } from '@/components/Profile/ProfileTabs.js';
import { Title } from '@/components/Profile/Title.js';
import { WalletInfo } from '@/components/Profile/WalletInfo.js';
import { ProfileDetailEffect } from '@/components/ProfileDetailEffect.js';
import { SuspendedAccountFallback } from '@/components/SuspendedAccountFallback.js';
import { SuspendedAccountInfo } from '@/components/SuspendedAccountInfo.js';
import { Source } from '@/constants/enum.js';
import { FetchError } from '@/constants/error.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveFireflyProfiles } from '@/helpers/resolveFireflyProfiles.js';
import type { FireflyIdentity, FireflyProfile } from '@/providers/types/Firefly.js';
import { getProfileById } from '@/services/getProfileById.js';

export async function ProfilePageLayout({
    identity,
    children,
    profiles,
}: PropsWithChildren<{ identity: FireflyIdentity; profiles: FireflyProfile[] }>) {
    const resolvedSource = narrowToSocialSource(identity.source);
    const { walletProfile } = resolveFireflyProfiles(identity, profiles);

    try {
        const profile =
            identity.id && identity.source !== Source.Wallet ? await getProfileById(resolvedSource, identity.id) : null;
        const profileMissing = !profile && !walletProfile && !profiles.length;

        if (profileMissing) return <ProfileNotFound />;

        return (
            <>
                <ProfileSourceTabs profiles={profiles} identity={identity} />
                {profile || walletProfile ? <Title profile={profile} profiles={profiles} /> : null}
                {identity.source === Source.Wallet && walletProfile ? (
                    <WalletInfo profile={walletProfile} />
                ) : profile ? (
                    <Info profile={profile} />
                ) : null}
                <ProfileTabs profiles={profiles} identity={identity} />
                <NoSSR>{children}</NoSSR>
                <ProfileDetailEffect profile={profile} identity={identity} />
            </>
        );
    } catch (error) {
        if (error instanceof FetchError && error.status === StatusCodes.FORBIDDEN) {
            return (
                <>
                    <SuspendedAccountInfo source={resolvedSource} />
                    <SuspendedAccountFallback />
                </>
            );
        }

        throw error;
    }
}
