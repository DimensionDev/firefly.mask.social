import { memo, useMemo, type HTMLProps } from 'react';

import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { SuperFollow } from '@/components/Posts/SuperFollow.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useSuperFollowModule } from '@/hooks/useSuperFollow.js';
import { useToggleFollow } from '@/hooks/useToggleFollow.js';
import { DraggablePopoverRef, LoginModalRef, SuperFollowModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface BaseToggleFollowButtonProps extends Omit<HTMLProps<HTMLButtonElement>, 'children'> {
    profile: Profile;
    children: (isSuperFollow: boolean, loading: boolean) => React.ReactNode;
}

export const BaseToggleFollowButton = memo(function BaseToggleFollowButton({
    ref,
    profile,
    onClick,
    children,
    ...props
}: BaseToggleFollowButtonProps) {
    const [loading, toggleFollow] = useToggleFollow(profile);
    const isLogin = useIsLogin(profile.source);
    const isMedium = useIsMedium();

    const isFollowing = !!profile.viewerContext?.following;

    const { followModule, loading: moduleLoading } = useSuperFollowModule(profile, isFollowing);

    const showSuperFollow = !isFollowing && !!followModule;

    const buttonLabel = useMemo(
        () => children(showSuperFollow, loading || moduleLoading),
        [showSuperFollow, loading, moduleLoading, children],
    );

    return (
        <ClickableButton
            {...props}
            disabled={loading || moduleLoading || props.disabled}
            onClick={(event) => {
                onClick?.(event);
                if (!isLogin) {
                    LoginModalRef.open({ source: profile.source });
                    return;
                }
                if (showSuperFollow) {
                    isMedium
                        ? SuperFollowModalRef.open({ profile })
                        : DraggablePopoverRef.open({
                              content: (
                                  <SuperFollow
                                      profile={profile}
                                      showCloseButton={false}
                                      onClose={DraggablePopoverRef.close}
                                  />
                              ),
                          });
                    return;
                }
                toggleFollow.mutate();
            }}
        >
            {buttonLabel}
        </ClickableButton>
    );
});
