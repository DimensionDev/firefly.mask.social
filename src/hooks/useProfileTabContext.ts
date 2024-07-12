'use client';

import { useState } from 'react';
import { createContainer } from 'unstated-next';

import { Source } from '@/constants/enum.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfile.js';
import { useFireflyProfile } from '@/hooks/useFireflyProfile.js';

export interface ProfileTab {
    source: Source;
    identity?: string;
}

function useProfileTabState(initialTab?: ProfileTab) {
    const [profileTab, setProfileTab] = useState<ProfileTab>(initialTab ?? { source: Source.Farcaster });

    const fireflyProfile = useFireflyProfile(profileTab.source, profileTab.identity);
    const currentFireflyProfilesAll = useCurrentFireflyProfilesAll();

    return {
        profile: currentFireflyProfilesAll.find(
            (x) => x.source === profileTab.source && x.identity === profileTab.identity,
        ),

        profileTab,
        setProfileTab,
    };
}

export const ProfileTabContext = createContainer(useProfileTabState);
