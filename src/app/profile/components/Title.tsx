import FollowButton from '@/app/profile/components/FollowButton.js';
import { Image } from '@/esm/Image.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useRouter } from 'next/navigation.js';

interface TitleProps {
    profile?: Profile;
}
export default function Title({ profile }: TitleProps) {
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

            {profile ? <FollowButton profile={profile} /> : null}
        </div>
    );
}
