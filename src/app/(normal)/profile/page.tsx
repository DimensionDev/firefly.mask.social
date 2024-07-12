'use client';

import { first } from 'lodash-es';
import { redirect, RedirectType } from 'next/navigation.js';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useCurrentFireflyProfiles } from '@/hooks/useCurrentFireflyProfile.js';
import { FireflyProfileContext } from '@/hooks/useProfileContext.js';
import { useFireflyProfileState } from '@/store/useProfileTabsStore.js';

export default function Page() {
    const { fireflyProfile: currentProfileTabState } = useFireflyProfileState();

    const currentFireflyProfiles = useCurrentFireflyProfiles();
    const profile = first(currentFireflyProfiles);

    if (profile) {
        redirect(`/profile/${profile.identity}?source=${resolveSourceInURL(profile.source)}`, RedirectType.replace);
    }

    return (
        <FireflyProfileContext.Provider
            initialState={{
                source: currentProfileTabState.source,
                identity:
                    currentProfileTabState.identity ||
                    currentFireflyProfiles.find((x) => x.source === currentProfileTabState.source)?.identity,
            }}
        >
            <ProfilePage profiles={currentFireflyProfiles} />
        </FireflyProfileContext.Provider>
    );
}
