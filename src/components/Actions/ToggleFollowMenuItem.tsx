import { t, Trans } from '@lingui/macro';
import { memo } from 'react';

import FollowUserIcon from '@/assets/follow-user.svg';
import LoadingIcon from '@/assets/loading.svg';
import UnFollowUserIcon from '@/assets/unfollow-user.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import type { ClickableButtonProps } from '@/components/ClickableButton.js';
import { SuperFollow } from '@/components/SuperFollow/index.js';
import { useSuperFollowModule } from '@/hooks/useSuperFollow.js';
import { useToggleFollow } from '@/hooks/useToggleFollow.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ToggleFollowMenuItemProps extends Omit<ClickableButtonProps, 'children'> {
    profile: Profile;
}

export const ToggleFollowMenuItem = memo<ToggleFollowMenuItemProps>(function ToggleFollowMenuItem({
    profile,
    onClick,
}) {
    const isFollowing = !!profile.viewerContext?.following;

    const { followModule, loading } = useSuperFollowModule(profile, isFollowing);
    const [, toggleFollow] = useToggleFollow(profile);

    const showSuperFollow = !isFollowing && !!followModule;

    return showSuperFollow ? (
        <SuperFollow
            profile={profile}
            onClick={onClick}
            className="flex h-8 cursor-pointer items-center space-x-2 px-3 py-1 hover:bg-bg"
        >
            <FollowUserIcon width={18} height={18} />
            <span className="font-bold leading-[22px] text-main">
                <Trans>Super Follow</Trans>
            </span>
        </SuperFollow>
    ) : (
        <MenuButton
            disabled={loading}
            onClick={async () => {
                onClick?.();
                toggleFollow.mutate();
            }}
        >
            {loading ? (
                <LoadingIcon width={18} height={18} className="animate-spin" />
            ) : isFollowing ? (
                <UnFollowUserIcon width={18} height={18} />
            ) : (
                <FollowUserIcon width={18} height={18} />
            )}
            <span className="font-bold leading-[22px] text-main">
                {isFollowing ? t`Unfollow @${profile.handle}` : t`Follow @${profile.handle}`}
            </span>
        </MenuButton>
    );
});
