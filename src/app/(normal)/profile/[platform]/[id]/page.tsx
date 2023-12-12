'use client';

import FarcasterProfile from '@/components/Profile/FarcasterProfile.js';
import LensProfile from '@/components/Profile/LensProfile.js';
import { SocialPlatform } from '@/constants/enum.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface ProfileProps {
    params: { handle: string };
}
export default function Profile({ params: { handle } }: ProfileProps) {
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();

    if (currentSocialPlatform === SocialPlatform.Lens) {
        return <LensProfile handle={handle} />;
    }

    if (currentSocialPlatform === SocialPlatform.Farcaster) {
        return <FarcasterProfile id={handle} />;
    }

    return null;
}
