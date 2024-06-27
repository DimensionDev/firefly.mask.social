import { t, Trans } from '@lingui/macro';
import { forwardRef } from 'react';

import MuteIcon from '@/assets/mute.svg';
import UnmuteIcon from '@/assets/unmute.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { useIsProfileMuted } from '@/hooks/useIsProfileMuted.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    profile: Profile;
    onConfirm?(): void;
    onToggle?(profile: Profile): Promise<boolean>;
}

export const MuteProfileButton = forwardRef<HTMLButtonElement, Props>(function MuteProfileButton(
    { profile, onConfirm, onToggle, ...rest }: Props,
    ref,
) {
    const muted = useIsProfileMuted(profile);
    return (
        <MenuButton
            {...rest}
            onClick={async () => {
                rest.onClick?.();
                if (!muted) {
                    const confirmed = await ConfirmModalRef.openAndWaitForClose({
                        title: t`Mute @${profile.handle}`,
                        variant: 'normal',
                        content: (
                            <div className="text-main">
                                <Trans>Posts from @{profile.handle} will now be hidden in your home timeline</Trans>
                            </div>
                        ),
                    });
                    if (!confirmed) return;
                    onConfirm?.();
                }
                await onToggle?.(profile);
            }}
            ref={ref}
        >
            {muted ? <UnmuteIcon width={18} height={18} /> : <MuteIcon width={18} height={18} />}
            <span className="font-bold leading-[22px] text-main">
                {muted ? <Trans>Unmute @{profile.handle}</Trans> : <Trans>Mute @{profile.handle}</Trans>}
            </span>
        </MenuButton>
    );
});
