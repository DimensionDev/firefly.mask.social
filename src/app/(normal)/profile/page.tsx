'use client';

import { first } from 'lodash-es';
import { redirect, RedirectType, useSearchParams } from 'next/navigation.js';
import { useEffect, useMemo } from 'react';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import type { SocialSourceInURL } from '@/constants/enum.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveFireflyIdentity } from '@/helpers/resolveFireflyProfileId.js';
import { resolveProfileId } from '@/helpers/resolveProfileId.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useCurrentFireflyProfiles } from '@/hooks/useCurrentFireflyProfiles.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { useFireflyIdentityState } from '@/store/useFireflyIdentityStore.js';

export default function Page() {
    const { setIdentity } = useFireflyIdentityState();
    const searchParam = useSearchParams();

    const currentProfiles = useCurrentProfileAll();
    const profiles = useCurrentFireflyProfiles();

    const profile = useMemo(() => {
        const sourceInUrl = searchParam.get('source') as SocialSourceInURL;
        if (sourceInUrl) {
            const source = narrowToSocialSource(resolveSourceFromUrl(sourceInUrl));
            return resolveFireflyIdentity(currentProfiles[source]);
        }
        return first(profiles)?.identity ?? null;
    }, [profiles, currentProfiles, searchParam]);

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

    return <ProfilePage profiles={profiles} />;
}
