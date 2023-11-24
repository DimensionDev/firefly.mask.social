import { i18n } from '@lingui/core';
import { useMemo, useState } from 'react';

import { classNames } from '@/helpers/classNames.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

enum FollowButtonState {
    Follow = 'Follow',
    Unfollow = 'Unfollow',
    Following = 'Following',
}

interface FollowButtonProps {
    profile: Profile;
}

export default function FollowButton({ profile }: FollowButtonProps) {
    const [followHover, setFollowHover] = useState(false);

    const { buttonText, buttonState } = useMemo(() => {
        const isFollowing = profile?.viewerContext?.following;

        return {
            buttonText: isFollowing ? (followHover ? i18n._('Unfollow') : i18n._('Following')) : i18n._('Follow'),
            buttonState: isFollowing
                ? followHover
                    ? FollowButtonState.Unfollow
                    : FollowButtonState.Following
                : FollowButtonState.Follow,
        };
    }, [followHover, profile?.viewerContext?.following]);

    return (
        <button
            className={classNames(
                ' flex h-8 w-[100px] items-center justify-center rounded-full text-sm font-semibold transition-all',
                buttonState === FollowButtonState.Follow ? ' bg-lightMain text-white hover:opacity-80' : '',
                buttonState === FollowButtonState.Following ? ' border border-lightMain text-lightMain' : '',
                buttonState === FollowButtonState.Unfollow
                    ? ' border border-[#FF354580] bg-[#FF354533] text-[#FF354580]'
                    : '',
            )}
            onMouseMove={() => setFollowHover(true)}
            onMouseLeave={() => setFollowHover(false)}
        >
            {buttonText}
        </button>
    );
}
