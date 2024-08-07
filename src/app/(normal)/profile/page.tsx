'use client';

import { first } from 'lodash-es';
import { redirect, RedirectType, useSearchParams } from 'next/navigation.js';
import { useEffect, useMemo } from 'react';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import type { SocialSourceInURL } from '@/constants/enum.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { resolveProfileId } from '@/helpers/resolveProfileId.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useCurrentFireflyProfiles } from '@/hooks/useCurrentFireflyProfiles.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { useProfileTabState } from '@/store/useProfileTabStore.js';

export default function Page() {
    const { profileTab, setProfileTab } = useProfileTabState();
    const searchParam = useSearchParams();

    const currentProfiles = useCurrentProfileAll();
    const profiles = useCurrentFireflyProfiles();
    const profile = useMemo(() => {
        const urlSource = searchParam.get('source') as SocialSourceInURL;
        if (urlSource) {
            const source = narrowToSocialSource(resolveSourceFromUrl(urlSource));
            if (currentProfiles[source])
                return {
                    identity: resolveProfileId(currentProfiles[source]),
                    source,
                };
        }

        return first(profiles);
    }, [profiles, currentProfiles, searchParam]);

    useEffect(() => {
        const urlSource = searchParam.get('source') as SocialSourceInURL;
        const source = profile ? profile.source : urlSource ? resolveSourceFromUrl(urlSource) : null;

        if (source) {
            setProfileTab({
                source,
                id: profile?.identity || '',
            });
        }
    }, [profile, profileTab.id, searchParam, setProfileTab]);

    // profile link should be shareable
    if (profile) {
        redirect(`/profile/${profile.identity}?source=${resolveSourceInURL(profile.source)}`, RedirectType.replace);
    }

    return <ProfilePage profiles={profiles} />;
}
