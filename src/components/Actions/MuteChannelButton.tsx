import { SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { forwardRef } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
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
    { busy, channel, onStatusChange, ...rest }: Props,
    ref,
) {
    const { allBlockedChannels } = useBlockedChannelState();
    const currentProfile = useCurrentProfile(channel.source);
    const muted =
        currentProfile &&
        allBlockedChannels[`${currentProfile.source}:${currentProfile.profileId}`]?.includes(channel.id);

    return (
        <MenuButton
            {...rest}
            onClick={async () => {
                rest.onClick?.();
                const confirmed = await ConfirmModalRef.openAndWaitForClose({
                    title: muted ? t`Unmute` : t`Mute`,
                    content: (
                        <div className="text-main">
                            {muted ? (
                                <Trans>Confirm you want to unmute /{channel.id}?</Trans>
                            ) : (
                                <Trans>Confirm you want to mute /{channel.id}?</Trans>
                            )}
                        </div>
                    ),
                });
                if (!onStatusChange || !confirmed) return;
                const result = await onStatusChange(channel);
                if (result === false) {
                    enqueueErrorMessage(
                        muted ? t`Failed to unmute /${channel.id}.` : t`Failed to mute /${channel.id}.`,
                    );
                }
            }}
            ref={ref}
        >
            {busy ? (
                <LoadingIcon width={24} height={24} className="animate-spin text-danger" />
            ) : (
                <SpeakerXMarkIcon width={24} height={24} />
            )}
            <span className="font-bold leading-[22px] text-main">
                {muted ? t`Unmute /${channel.id}` : t`Mute /${channel.id}`}
            </span>
        </MenuButton>
    );
});
