import { classNames } from '@/helpers/classNames.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useState, useMemo } from 'react';

interface FollowButtonProps {
    profile: Profile;
}
export default function FollowButton({ profile }: FollowButtonProps) {
    const [followHover, setFollowHover] = useState(false);

    const followButtonText = useMemo(() => {
        if (profile?.viewerContext?.following) {
            if (followHover) {
                return 'Unfollow';
            }
            return 'Following';
        }

        return 'Follow';
    }, [followHover, profile?.viewerContext?.following]);

    return (
        <button
            className={classNames(
                ' flex h-8 w-[100px] items-center justify-center rounded-full text-sm font-semibold transition-all',
                followButtonText === 'Follow' ? ' bg-textMain text-white hover:opacity-80' : '',
                followButtonText === 'Following' ? ' border border-textMain text-textMain' : '',
                followButtonText === 'Unfollow' ? ' border border-[#FF354580] bg-[#FF354533] text-[#FF354580]' : '',
            )}
            onMouseMove={() => setFollowHover(true)}
            onMouseLeave={() => setFollowHover(false)}
        >
            {followButtonText}
        </button>
    );
}
