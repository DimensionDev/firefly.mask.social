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
import { Title } from '@/components/Profile/Title.js';
import { PageRoute, Source } from '@/constants/enum.js';
import { FetchError } from '@/constants/error.js';
import { EMPTY_LIST, SITE_NAME } from '@/constants/index.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveFireflyProfiles } from '@/helpers/resolveFireflyProfiles.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { useUpdateCurrentVisitingProfile } from '@/hooks/useCurrentVisitingProfile.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireflyProfile } from '@/providers/types/Firefly.js';
import { getProfileById } from '@/services/getProfileById.js';
import { useFireflyIdentityState } from '@/store/useFireflyIdentityStore.js';
import { useTwitterStateStore } from '@/store/useProfileStore.js';

interface ProfilePageProps {
    profiles: FireflyProfile[];
}

export function ProfilePage({ profiles }: ProfilePageProps) {
    const { identity } = useFireflyIdentityState();
    const resolvedSource = narrowToSocialSource(identity.source);

    const pathname = usePathname();
    const currentProfiles = useCurrentFireflyProfilesAll();
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();

    const isLogin = useIsLogin(resolvedSource);
    const isOthersProfile = !currentProfiles.some((x) => isSameFireflyIdentity(x.identity, identity));

    const { walletProfile } = resolveFireflyProfiles(identity, profiles);
    const { source, id } = identity;

    const {
        data: profile = null,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['profile', source, id],
        queryFn: async () => {
            if (!id || source === Source.Wallet || (!isOthersProfile && !isLogin)) return null;
            return getProfileById(resolvedSource, id);
        },
        retry(failureCount, error) {
            if (error instanceof FetchError && error.status === StatusCodes.FORBIDDEN) return false;
            return failureCount <= 3;
        },
    });

    const { data: relations = EMPTY_LIST } = useQuery({
        enabled: source === Source.Wallet,
        queryKey: ['relation', source, id],
        queryFn: async () => {
            if (source !== Source.Wallet || !id) return EMPTY_LIST;
            return FireflySocialMediaProvider.getNextIDRelations('ethereum', id);
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
        !profile && !walletProfile && ((identity.source === Source.Twitter && !twitterProfile) || !profiles.length);

    const profileNotFound = isFinalized && profileMissing;

    const showFallback =
        identity.source !== Source.Wallet &&
        ((!isOthersProfile && (!isLogin || profileNotFound)) || (profileNotFound && pathname === PageRoute.Profile));

    if (isLoading && source !== Source.Twitter) {
        return <Loading />;
    }

    if (showFallback) {
        return <NotLoginFallback source={resolvedSource} className="!pt-0" />;
    }

    return (
        <div>
            {!isSuspended && (profile || walletProfile) && !showFallback ? (
                <Title profile={profile} profiles={profiles} isOthersProfile={isOthersProfile} />
            ) : null}
            {profileNotFound ? (
                <ProfileNotFound />
            ) : (
                <ProfileContent profile={profile} profiles={profiles} relations={relations} isSuspended={isSuspended} />
            )}
        </div>
    );
}
