'use client';

import { first } from 'lodash-es';
import { redirect, RedirectType, useSearchParams } from 'next/navigation.js';
import { useEffect, useMemo } from 'react';

import { LoginRequiredGuard } from '@/components/LoginRequiredGuard.js';
import { ProfileInfo } from '@/components/Profile/ProfileInfo.js';
import { ProfilePageTimeline } from '@/components/Profile/ProfilePageTimeline.js';
import { ProfileSourceTabs } from '@/components/Profile/ProfileSourceTabs.js';
import type { SocialSourceInURL } from '@/constants/enum.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveFireflyIdentity } from '@/helpers/resolveFireflyProfileId.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useCurrentFireflyProfiles } from '@/hooks/useCurrentFireflyProfiles.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { ProfilePageContext } from '@/hooks/useProfilePageContext.js';
import { useFireflyIdentityState } from '@/store/useFireflyIdentityStore.js';

export default function Page() {
    const { setIdentity } = useFireflyIdentityState();
    const searchParam = useSearchParams();

    const currentProfiles = useCurrentProfileAll();
    const profiles = useCurrentFireflyProfiles();
    const sourceInUrl = searchParam.get('source') as SocialSourceInURL;
    const source = narrowToSocialSource(resolveSourceFromUrl(sourceInUrl));

    const profile = useMemo(() => {
        if (sourceInUrl) {
            return resolveFireflyIdentity(currentProfiles[source]);
        }
        return first(profiles)?.identity ?? null;
    }, [sourceInUrl, profiles, currentProfiles, source]);

    useEffect(() => {
        const sourceInUrl = searchParam.get('source') as SocialSourceInURL;
        const source = profile ? profile.source : sourceInUrl ? resolveSourceFromUrl(sourceInUrl) : null;

        if (source) {
            setIdentity({
                source,
                id: profile?.id || '',
            });
        }
    }, [profile, searchParam, setIdentity]);

    // profile link should be shareable
    if (profile) {
        redirect(`/profile/${profile.id}?source=${resolveSourceInURL(profile.source)}`, RedirectType.replace);
    }

    return (
        <>
            <ProfileSourceTabs profiles={profiles} />
            <LoginRequiredGuard source={source} className="!pt-0">
                <ProfileInfo profiles={profiles}>
                    <ProfilePageContext.Provider>
                        <ProfilePageTimeline />
                    </ProfilePageContext.Provider>
                </ProfileInfo>
            </LoginRequiredGuard>
        </>
    );
}
