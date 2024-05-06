import { SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { forwardRef } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Channel } from '@/providers/types/SocialMedia.js';
import { useBlockedChannelState } from '@/store/useBlockedChannelStore.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    busy?: boolean;
    channel: Channel;
    onStatusChange?(channel: Channel): Promise<boolean>;
}

export const MuteChannelButton = forwardRef<HTMLButtonElement, Props>(function MuteChannelButton(
    { busy, channel, className, onStatusChange, ...rest }: Props,
    ref,
) {
    const { allBlockedChannels } = useBlockedChannelState();
    const currentProfile = useCurrentProfile(channel.source);
    const muted =
        currentProfile &&
        allBlockedChannels[`${currentProfile.source}:${currentProfile.profileId}`]?.includes(channel.id);

    return (
        <ClickableButton
            className={classNames('flex cursor-pointer items-center space-x-2 p-4 hover:bg-bg', className)}
            {...rest}
            onClick={async () => {
                rest.onClick?.();
                const confirmed = await ConfirmModalRef.openAndWaitForClose({
                    title: t`Block`,
                    content: (
                        <div className="text-main">
                            <Trans>
                                Confirm you want to {muted ? t`unmute` : t`mute`} /{channel.name}
                            </Trans>
                        </div>
                    ),
                });
                if (!onStatusChange) return;
                const result = await onStatusChange(channel);
                if (result === false) {
                    enqueueErrorMessage(t`Failed to block /${channel.name}`);
                }
            }}
            ref={ref}
        >
            {busy ? (
                <LoadingIcon width={24} height={24} className="animate-spin text-danger" />
            ) : (
                <SpeakerXMarkIcon width={24} height={24} />
            )}
            <span className="text-[17px] font-bold leading-[22px] text-main">
                <Trans>
                    {muted ? t`Unmute` : t`Mute`} /{channel.name}
                </Trans>
            </span>
        </ClickableButton>
    );
});
