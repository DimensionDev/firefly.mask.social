'use client';

import { useState } from 'react';
import { createContainer } from 'unstated-next';

import { Source } from '@/constants/enum.js';

export interface ProfileTab {
    source: Source;
    identity?: string;
}

function useProfileTabState(initialTab?: ProfileTab) {
    const [profileTab, setProfileTab] = useState<ProfileTab>(initialTab ?? { source: Source.Farcaster });

    return {
        profileTab,
        setProfileTab,
    };
}

export const ProfileTabContext = createContainer(useProfileTabState);
