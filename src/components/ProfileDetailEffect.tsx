'use client';
import { useEffect } from 'react';

import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import { useUpdateCurrentVisitingProfile } from '@/hooks/useCurrentVisitingProfile.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useFireflyIdentityState } from '@/store/useFireflyIdentityStore.js';

export function ProfileDetailEffect({ identity, profile }: { identity: FireflyIdentity; profile: Profile | null }) {
    useUpdateCurrentVisitingProfile(profile);

    useEffect(() => {
        const { identity: globalIdentity, setIdentity } = useFireflyIdentityState.getState();
        if (isSameFireflyIdentity(globalIdentity, identity)) return;
        setIdentity(identity);
    }, [identity]);

    return null;
}
