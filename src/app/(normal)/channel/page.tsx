'use client';

import { ProfilePage } from '@/app/(normal)/channel/pages/Channel.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export default function Page() {
    const currentSource = useGlobalState.use.currentSource();
    const currentProfile = useCurrentProfile(currentSource);
    if (!currentProfile) return null;
    return <ProfilePage channel={currentProfile} />;
}
