'use client';

import { first } from 'lodash-es';
import { redirect, RedirectType } from 'next/navigation.js';
import { useEffect } from 'react';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useCurrentFireflyProfiles } from '@/hooks/useCurrentFireflyProfiles.js';
import { useProfileTabState } from '@/store/useProfileTabStore.js';

export default function Page() {
    const { profileTab, setProfileTab } = useProfileTabState();

    const profiles = useCurrentFireflyProfiles();
    const profile = first(profiles);

    useEffect(() => {
        if (!profileTab.identity) {
            setProfileTab({
                isMyProfile: true,
                source: profileTab.source,
                identity: profiles.find((x) => x.source === profileTab.source)?.identity,
            });
        }
    }, [profiles, profileTab.identity, profileTab.source, setProfileTab]);

    // profile link should be shareable
    if (profile) {
        redirect(`/profile/${profile.identity}?source=${resolveSourceInURL(profile.source)}`, RedirectType.replace);
    }

    return <ProfilePage profiles={profiles} />;
}
