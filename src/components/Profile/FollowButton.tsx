import { t } from '@lingui/macro';
import { memo, useState } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { classNames } from '@/helpers/classNames.js';
import { useToggleFollow } from '@/hooks/useToggleFollow.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

enum FollowLabel {
    Follow = 'Follow',
    Unfollow = 'Unfollow',
    Following = 'Following',
}

interface FollowButtonProps {
    profile: Profile;
}

const FollowButton = memo(function FollowButton({ profile }: FollowButtonProps) {
    const [followHover, setFollowHover] = useState(false);
    const [isFollowing, { loading }, handleToggle] = useToggleFollow(profile);

    const buttonText = isFollowing ? (followHover ? t`Unfollow` : t`Following`) : t`Follow`;
    const buttonState = isFollowing ? (followHover ? FollowLabel.Unfollow : FollowLabel.Following) : FollowLabel.Follow;

    return (
        <button
            className={classNames(
                ' flex h-8 w-[100px] items-center justify-center rounded-full text-[15px] text-sm font-semibold transition-all disabled:cursor-not-allowed',
                buttonState === FollowLabel.Follow ? ' bg-main text-primaryBottom hover:opacity-80' : '',
                buttonState === FollowLabel.Following ? ' border-[1.5px] border-lightMain text-lightMain' : '',
                buttonState === FollowLabel.Unfollow
                    ? ' border-[1.5px] border-danger border-opacity-50 bg-danger bg-opacity-20 text-danger'
                    : '',
            )}
            disabled={loading}
            onMouseEnter={() => setFollowHover(true)}
            onMouseLeave={() => setFollowHover(false)}
            onClick={handleToggle}
        >
            {loading ? <LoadingIcon width={16} height={16} className="mr-2 animate-spin" /> : null}
            {buttonText}
        </button>
    );
});

export default FollowButton;
