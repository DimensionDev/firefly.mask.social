'use client';

import { compact, first } from 'lodash-es';
import { redirect, RedirectType } from 'next/navigation.js';
import { useMemo } from 'react';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { Source } from '@/constants/enum.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { ProfileContext } from '@/hooks/useProfileContext.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';
import { useProfileTabState } from '@/store/useProfileTabsStore.js';

export default function Page() {
    const { currentProfileTabState } = useProfileTabState();

    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();

    const defaultProfiles = useMemo(() => {
        return compact([
            currentFarcasterProfile
                ? {
                      identity: currentFarcasterProfile.profileId,
                      source: Source.Farcaster,
                      displayName: currentFarcasterProfile.handle,
                      __origin__: null,
                  }
                : undefined,
            currentLensProfile
                ? {
                      identity: currentLensProfile.handle,
                      source: Source.Lens,
                      displayName: currentLensProfile.handle,
                      __origin__: null,
                  }
                : undefined,
            currentTwitterProfile
                ? {
                      identity: currentTwitterProfile.profileId,
                      source: Source.Twitter,
                      displayName: currentTwitterProfile.handle,
                      __origin__: null,
                  }
                : undefined,
        ]);
    }, [currentLensProfile, currentFarcasterProfile, currentTwitterProfile]);

    const profile = first(defaultProfiles);
    if (profile) {
        redirect(`/profile/${profile.identity}?source=${resolveSourceInURL(profile.source)}`, RedirectType.replace);
    }

    return (
        <ProfileContext.Provider
            initialState={{
                source: currentProfileTabState.source,
                identity:
                    currentProfileTabState.identity ||
                    defaultProfiles.find((x) => x.source === currentProfileTabState.source)?.identity,
            }}
        >
            <ProfilePage profiles={defaultProfiles} />
        </ProfileContext.Provider>
    );
}
