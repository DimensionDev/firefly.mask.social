'use client';

import { first } from 'lodash-es';
import { redirect, RedirectType } from 'next/navigation.js';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useCurrentFireflyProfileAll } from '@/hooks/useCurrentProfile.js';
import { ProfileContext } from '@/hooks/useProfileContext.js';
import { useProfileTabState } from '@/store/useProfileTabsStore.js';

export default function Page() {
    const { currentProfileTabState } = useProfileTabState();

    const currentFireflyProfileAll = useCurrentFireflyProfileAll();
    const profile = first(currentFireflyProfileAll);

    if (profile) {
        redirect(`/profile/${profile.identity}?source=${resolveSourceInURL(profile.source)}`, RedirectType.replace);
    }

    return (
        <ProfileContext.Provider
            initialState={{
                source: currentProfileTabState.source,
                identity:
                    currentProfileTabState.identity ||
                    currentFireflyProfileAll.find((x) => x.source === currentProfileTabState.source)?.identity,
            }}
        >
            <ProfilePage profiles={currentFireflyProfileAll} />
        </ProfileContext.Provider>
    );
}
