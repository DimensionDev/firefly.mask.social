import { t } from '@lingui/macro';
import { useMemo, useState } from 'react';

import { classNames } from '@/helpers/classNames.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { LoginModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

enum FollowButtonState {
    Follow = 'Follow',
    Unfollow = 'Unfollow',
    Following = 'Following',
}

interface FollowButtonProps {
    profile: Profile;
    isMyProfile?: boolean;
}

export default function FollowButton({ profile, isMyProfile }: FollowButtonProps) {
    const [followHover, setFollowHover] = useState(false);

    const isLogin = useIsLogin();

    const { buttonText, buttonState } = useMemo(() => {
        const isFollowing = isMyProfile || profile?.viewerContext?.following;

        return {
            buttonText: isFollowing ? (followHover ? t`Unfollow` : t`Following`) : t`Follow`,
            buttonState: isFollowing
                ? followHover
                    ? FollowButtonState.Unfollow
                    : FollowButtonState.Following
                : FollowButtonState.Follow,
        };
    }, [followHover, isMyProfile, profile?.viewerContext?.following]);

    return (
        <button
            className={classNames(
                ' flex h-8 w-[100px] items-center justify-center rounded-full text-[15px] text-sm font-semibold transition-all',
                buttonState === FollowButtonState.Follow ? ' bg-main text-primaryBottom hover:opacity-80' : '',
                buttonState === FollowButtonState.Following ? ' border-[1.5px] border-lightMain text-lightMain' : '',
                buttonState === FollowButtonState.Unfollow
                    ? ' border-[1.5px] border-danger border-opacity-50 bg-danger bg-opacity-20 text-danger text-opacity-50'
                    : '',
            )}
            onMouseMove={() => setFollowHover(true)}
            onMouseLeave={() => setFollowHover(false)}
            onClick={() => {
                if (!isLogin) {
                    LoginModalRef.open();
                }
            }}
        >
            {buttonText}
        </button>
    );
}
