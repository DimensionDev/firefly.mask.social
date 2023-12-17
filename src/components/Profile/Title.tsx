import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useRouter } from 'next/navigation.js';
import { useState } from 'react';

import ComeBackIcon from '@/assets/comeback.svg';
import FollowButton from '@/components/Profile/FollowButton.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface TitleProps {
    profile: Profile;
}

export default function Title({ profile }: TitleProps) {
    const [reached, setReached] = useState(false);

    const router = useRouter();

    const { scrollY } = useScroll();
    useMotionValueEvent(scrollY, 'change', (value) => {
        setReached(value > 48);
    });

    return (
        <div className=" sticky top-0 z-10 flex h-[72px] items-center justify-between bg-white px-4 dark:bg-black">
            <div className=" flex items-center gap-7">
                <ComeBackIcon className=" cursor-pointer text-lightMain" onClick={() => router.back()} />
                <span className=" text-xl font-black text-lightMain">{profile.displayName ?? '-'}</span>
            </div>

            {profile && reached ? <FollowButton profile={profile} /> : null}
        </div>
    );
}
