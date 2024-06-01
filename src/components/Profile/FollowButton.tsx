import { t } from '@lingui/macro';
import { memo, useState } from 'react';

import { UnmuteButton } from '@/components/Actions/UnmuteButton.js';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { useIsMuted } from '@/hooks/useIsMuted.js';
import { useToggleFollow } from '@/hooks/useToggleFollow.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

enum State {
    Follow = 'Follow',
    Unfollow = 'Unfollow',
    Following = 'Following',
}

interface FollowButtonProps extends Omit<ClickableButtonProps, 'children'> {
    profile: Profile;
}

export const FollowButton = memo(function FollowButton({ profile, className, ...rest }: FollowButtonProps) {
    const [hovering, setHovering] = useState(false);
    const isFollowing = !!profile.viewerContext?.following;
    const [loading, toggleFollow] = useToggleFollow(profile);

    const muted = useIsMuted(profile);

    if (muted) {
        return <UnmuteButton profile={profile} />;
    }
    const buttonText = isFollowing ? (hovering && !loading ? t`Unfollow` : t`Following`) : t`Follow`;
    const buttonState = isFollowing ? (hovering && !loading ? State.Unfollow : State.Following) : State.Follow;

    return (
        <ClickableButton
            className={classNames(
                'flex h-8 min-w-[100px] items-center justify-center rounded-full px-2 text-[15px] font-semibold transition-all',
                buttonState === State.Follow ? 'bg-main text-primaryBottom hover:opacity-80' : '',
                buttonState === State.Following ? 'border-[1.5px] border-lightMain text-lightMain' : '',
                buttonState === State.Unfollow
                    ? 'border-[1.5px] border-danger border-opacity-50 bg-danger bg-opacity-20 text-danger'
                    : '',
                className,
            )}
            {...rest}
            disabled={loading}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={() => {
                toggleFollow.mutate();
            }}
        >
            {buttonText}
        </ClickableButton>
    );
});
