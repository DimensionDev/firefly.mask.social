'use client';

import { redirect, RedirectType } from 'next/navigation.js';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { SORTED_PROFILE_SOURCES } from '@/constants/index.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { ProfileTabContext } from '@/hooks/useProfileTabContext.js';
import { useProfileTabState } from '@/store/useProfileTabStore.js';

export default function Page() {
    const { profileTab } = useProfileTabState();

    const profiles = useCurrentFireflyProfilesAll();
    const profile = profiles.find((x) => SORTED_PROFILE_SOURCES.includes(x.source));

    // profile link should be shareable
    if (profile) {
        redirect(`/profile/${profile.identity}?source=${resolveSourceInURL(profile.source)}`, RedirectType.replace);
    }

    return (
        <ProfileTabContext.Provider initialState={profileTab}>
            <ProfilePage profiles={profiles} />
        </ProfileTabContext.Provider>
    );
}
