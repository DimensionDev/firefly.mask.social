'use client';

import { first } from 'lodash-es';
import { redirect, RedirectType } from 'next/navigation.js';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useCurrentFireflyProfiles } from '@/hooks/useCurrentFireflyProfiles.js';
import { ProfileTabContext } from '@/hooks/useProfileTabContext.js';
import { useProfileTabState } from '@/store/useProfileTabStore.js';

export default function Page() {
    const { profileTab } = useProfileTabState();

    const profiles = useCurrentFireflyProfiles();
    const profile = first(profiles);

    // profile link should be shareable
    if (profile) {
        redirect(`/profile/${profile.identity}?source=${resolveSourceInURL(profile.source)}`, RedirectType.replace);
    }

    return (
        <ProfileTabContext.Provider
            initialState={{
                source: profileTab.source,
                identity: profileTab.identity ?? profiles.find((x) => x.source === profileTab.source)?.identity,
            }}
        >
            <ProfilePage profiles={profiles} />
        </ProfileTabContext.Provider>
    );
}
