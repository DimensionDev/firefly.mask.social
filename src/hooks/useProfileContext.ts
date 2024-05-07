'use client';
import { createContext, useContext } from 'react';

import { Source } from '@/constants/enum.js';

export const ProfileContext = createContext<{
    source: Source;
    identity?: string;
    update?: (value: { source: Source; identity: string }) => void;
}>({
    source: Source.Farcaster,
});

export function useProfileContext() {
    return useContext(ProfileContext);
}
