import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { forwardRef } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    busy?: boolean;
    profile: Profile;
    onConfirm?(): void;
    onToggleBlock?(profile: Profile): Promise<boolean>;
}

export const BlockUserButton = forwardRef<HTMLButtonElement, Props>(function BlockUserButton(
    { busy, profile, onConfirm, onToggleBlock, ...rest }: Props,
    ref,
) {
    const muted = profile.viewerContext?.blocking;
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
                await onToggleBlock?.(profile);
            }}
            ref={ref}
        >
            {busy ? (
                <LoadingIcon width={24} height={24} className="animate-spin text-danger" />
            ) : muted ? (
                <SpeakerWaveIcon width={24} height={24} />
            ) : (
                <SpeakerXMarkIcon width={24} height={24} />
            )}
            <span className="font-bold leading-[22px] text-main">
                {muted ? <Trans>Unmute @{profile.handle}</Trans> : <Trans>Mute @{profile.handle}</Trans>}
            </span>
        </MenuButton>
    );
});
