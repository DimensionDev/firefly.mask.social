import { t } from '@lingui/macro';
import { memo, useMemo, useState } from 'react';

import FollowIcon from '@/assets/follow-bold.svg';
import FollowedIcon from '@/assets/followed.svg';
import MutualFollowIcon from '@/assets/mutual-follow.svg';
import { ToggleMutedProfileButton } from '@/components/Actions/ToggleMutedProfileButton.js';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { useIsProfileMuted } from '@/hooks/useIsProfileMuted.js';
import { useToggleFollow } from '@/hooks/useToggleFollow.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

enum State {
    Follow = 'Follow',
    Unfollow = 'Unfollow',
    Following = 'Following',
}

interface FollowButtonProps extends Omit<ClickableButtonProps, 'children'> {
    profile: Profile;
    variant?: 'text' | 'icon';
    hasMutedButton?: boolean;
}

export const FollowButton = memo(function FollowButton({
    variant = 'text',
    profile,
    className,
    hasMutedButton = true,
    ...rest
}: FollowButtonProps) {
    const [hovering, setHovering] = useState(false);
    const [loading, toggleFollow] = useToggleFollow(profile);

    const muted = useIsProfileMuted(profile, hasMutedButton);

    const isFollowing = !!profile.viewerContext?.following;
    const isFollowedBy = !!profile.viewerContext?.followedBy;
    const buttonText = useMemo(() => {
        if (variant === 'text') {
            if (isFollowing) return hovering && !loading ? t`Unfollow` : t`Following`;
            return isFollowedBy ? t`Follow Back` : t`Follow`;
        }
        if (isFollowing) return <FollowedIcon className="h-4 w-4" />;
        return isFollowedBy ? <MutualFollowIcon className="h-4 w-4" /> : <FollowIcon className="h-4 w-4" />;
    }, [hovering, isFollowing, isFollowedBy, loading, variant]);

    if (hasMutedButton && muted) {
        return <ToggleMutedProfileButton muted={muted} profile={profile} className={className} {...rest} />;
    }
    const variantClassName = {
        text: 'min-w-[112px] box-border px-5 whitespace-nowrap',
        icon: 'w-8 max-w-8',
    }[variant];
    const buttonState = isFollowing ? (hovering && !loading ? State.Unfollow : State.Following) : State.Follow;

    return (
        <ClickableButton
            className={classNames(
                'flex h-8 items-center justify-center rounded-full text-[15px] font-semibold transition-all',
                variantClassName,
                className,
                {
                    'bg-main text-primaryBottom hover:opacity-80': buttonState === State.Follow,
                    'border border-lightMain text-lightMain': buttonState === State.Following,
                    'border border-danger border-opacity-50 bg-danger bg-opacity-20 text-danger':
                        buttonState === State.Unfollow,
                },
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
