'use client';

import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { usePathname } from 'next/navigation.js';
import { useMemo } from 'react';
import { useDocumentTitle } from 'usehooks-ts';

import { Loading } from '@/components/Loading.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { ProfileContent } from '@/components/Profile/ProfileContent.js';
import { ProfileNotFound } from '@/components/Profile/ProfileNotFound.js';
import { ProfileSourceTabs } from '@/components/Profile/ProfileSourceTabs.js';
import { Title } from '@/components/Profile/Title.js';
import { PageRoute, Source } from '@/constants/enum.js';
import { FetchError } from '@/constants/error.js';
import { EMPTY_LIST, SITE_NAME } from '@/constants/index.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveFireflyProfiles } from '@/helpers/resolveFireflyProfiles.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { useUpdateCurrentVisitingProfile } from '@/hooks/useCurrentVisitingProfile.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireflyProfile } from '@/providers/types/Firefly.js';
import { getProfileById } from '@/services/getProfileById.js';
import { useTwitterStateStore } from '@/store/useProfileStore.js';
import { useProfileTabState } from '@/store/useProfileTabStore.js';

interface ProfilePageProps {
    profiles: FireflyProfile[];
}

export function ProfilePage({ profiles }: ProfilePageProps) {
    const { profileTab } = useProfileTabState();
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();

    const resolvedSource = narrowToSocialSource(profileTab.source);

    const isLogin = useIsLogin(resolvedSource);

    const pathname = usePathname();
    const currentProfiles = useCurrentFireflyProfilesAll();
    const isOthersProfile = !currentProfiles.some(
        (x) => x.source === profileTab.source && x.identity === profileTab.identity,
    );

    const { walletProfile } = resolveFireflyProfiles(profileTab, profiles);
    const { source, identity } = profileTab;

    const {
        data: profile = null,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['profile', source, identity],
        queryFn: async () => {
            if (!identity || source === Source.Wallet || (!isOthersProfile && !isLogin)) return null;
            return getProfileById(resolvedSource, identity);
        },
        retry(failureCount, error) {
            if (error instanceof FetchError && error.status === StatusCodes.FORBIDDEN) return false;
            return failureCount <= 3;
        },
    });

    const { data: relations = EMPTY_LIST } = useQuery({
        enabled: source === Source.Wallet,
        queryKey: ['relation', source, identity],
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

    const isFinalized = !isSuspended && !isLoading;
    const twitterProfile = isOthersProfile ? profile : currentTwitterProfile || profile;
    const profileMissing =
        !profile && !walletProfile && ((profileTab.source === Source.Twitter && !twitterProfile) || !profiles.length);

    const profileNotFound = isFinalized && profileMissing;

    const showFallback =
        profileTab.source !== Source.Wallet &&
        ((!isOthersProfile && (!isLogin || profileNotFound)) || (profileNotFound && pathname === PageRoute.Profile));

    const header = (
        <>
            {!isSuspended && (profile || walletProfile) && !showFallback ? (
                <Title profile={profile} profiles={profiles} isOthersProfile={isOthersProfile} />
            ) : null}
            <ProfileSourceTabs profiles={profiles} />
        </>
    );

    if (isLoading && source !== Source.Twitter) {
        return (
            <>
                {header}
                <Loading />
            </>
        );
    }

    if (showFallback) {
        return (
            <>
                {header}
                <NotLoginFallback source={resolvedSource} />
            </>
        );
    }

    return (
        <div>
            {header}
            {profileNotFound ? (
                <ProfileNotFound />
            ) : (
                <ProfileContent profile={profile} profiles={profiles} relations={relations} isSuspended={isSuspended} />
            )}
        </div>
    );
}
