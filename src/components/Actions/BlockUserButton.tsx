import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { forwardRef } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    busy?: boolean;
    profile: Profile;
    onConfirm?(): void;
    onToggleBlock?(profile: Profile): Promise<boolean>;
}

export const BlockUserButton = forwardRef<HTMLButtonElement, Props>(function BlockUserButton(
    { busy, profile, className, onConfirm, onToggleBlock: onToggleBlock, ...rest }: Props,
    ref,
) {
    const blocking = profile.viewerContext?.blocking;
    return (
        <ClickableButton
            className={classNames('flex cursor-pointer items-center space-x-2 p-4 hover:bg-bg', className)}
            {...rest}
            onClick={async () => {
                rest.onClick?.();
                if (!blocking) {
                    const confirmed = await ConfirmModalRef.openAndWaitForClose({
                        title: t`Block`,
                        content: (
                            <div className="text-main">
                                <Trans>Confirm you want to mute @{profile.handle}?</Trans>
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
            ) : blocking ? (
                <SpeakerWaveIcon width={24} height={24} />
            ) : (
                <SpeakerXMarkIcon width={24} height={24} />
            )}
            <span className="text-[17px] font-bold leading-[22px] text-main">
                {blocking ? <Trans>Unmute @{profile.handle}</Trans> : <Trans>Mute @{profile.handle}</Trans>}
            </span>
        </ClickableButton>
    );
});
