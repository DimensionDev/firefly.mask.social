import { useRouter } from 'next/navigation.js';

import FollowButton from '@/app/profile/components/FollowButton.js';
import { Image } from '@/esm/Image.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface TitleProps {
    isMyProfile: boolean;
    profile?: Profile;
}

export default function Title({ isMyProfile, profile }: TitleProps) {
    const router = useRouter();

    return (
        <div className=" flex h-14 items-center justify-between px-4">
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

            {profile ? <FollowButton profile={profile} isMyProfile={isMyProfile} /> : null}
        </div>
    );
}
