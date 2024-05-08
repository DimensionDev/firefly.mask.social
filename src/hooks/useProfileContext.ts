'use client';

import { useState } from 'react';
import { createContainer } from 'unstated-next';

import { Source } from '@/constants/enum.js';

interface ProfileState {
    source: Source;
    identity?: string;
}
function useProfileContext(initialState?: ProfileState) {
    const [value, setValue] = useState<ProfileState>(initialState ?? { source: Source.Farcaster });

    return {
        ...value,
        update: setValue,
    };
}

export const ProfileContext = createContainer(useProfileContext);
