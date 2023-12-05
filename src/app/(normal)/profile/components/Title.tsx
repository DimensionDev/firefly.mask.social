import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useRouter } from 'next/navigation.js';
import { useState } from 'react';

import FollowButton from '@/app/(normal)/profile/components/FollowButton.js';
import ComeBackIcon from '@/assets/comeback.svg';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface TitleProps {
    isMyProfile: boolean;
    profile?: Profile;
}

export default function Title({ isMyProfile, profile }: TitleProps) {
    const [y, setY] = useState(0);

    const router = useRouter();

    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, 'change', (latest) => {
        setY(latest);
    });

    return (
        <div className=" sticky top-0 z-10 flex h-[72px] items-center justify-between bg-white px-4 dark:bg-black">
            <div className=" flex items-center gap-7">
                <ComeBackIcon className=" cursor-pointer text-lightMain" onClick={() => router.back()} />
                <span className=" text-lg font-black text-lightMain">{profile?.displayName ?? '-'}</span>
            </div>

            {profile && y >= 48 ? <FollowButton profile={profile} isMyProfile={isMyProfile} /> : null}
        </div>
    );
}
