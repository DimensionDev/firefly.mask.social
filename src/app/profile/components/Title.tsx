import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useRouter } from 'next/navigation.js';
import { useState } from 'react';

import FollowButton from '@/app/profile/components/FollowButton.js';
import { Image } from '@/esm/Image.js';
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
                <Image
                    src="/svg/comeback.svg"
                    width={24}
                    height={24}
                    alt="comeback"
                    className=" cursor-pointer"
                    onClick={() => router.back()}
                />
                <span className=" text-lg font-black text-[#0F1419]">{profile?.nickname ?? '-'}</span>
            </div>

            {profile && y >= 48 ? <FollowButton profile={profile} isMyProfile={isMyProfile} /> : null}
        </div>
    );
}
