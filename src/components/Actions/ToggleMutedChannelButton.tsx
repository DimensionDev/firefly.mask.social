import { t, Trans } from '@lingui/macro';
import { memo } from 'react';
import { useToggle } from 'react-use';

import { ToggleMutedButton } from '@/components/Actions/ToggleMutedButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { useToggleMutedChannel } from '@/hooks/useToggleMutedChannel.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    channel: Channel;
    defaultMuted?: boolean;
}

export const ToggleMutedChannelButton = memo(function ToggleMutedChannelButton({
    channel,
    defaultMuted = true,
    ...rest
}: Props) {
    // FIXME: we can use channel.blocked instead of defaultMuted
    const [isMuted, setIsMuted] = useToggle(defaultMuted);

    const [{ loading }, toggleMutedChannel] = useToggleMutedChannel();

    const onToggle = async () => {
        const confirmed = await ConfirmModalRef.openAndWaitForClose({
            title: t`${isMuted ? 'Unmute' : 'Mute'} /${channel.name}`,
            content: (
                <div className="text-main">
                    <Trans>
                        Confirm you want to {isMuted ? 'unmute' : 'mute'} /{channel.name}?
                    </Trans>
                </div>
            ),
        });
        if (!confirmed) return;
        const result = await toggleMutedChannel({ ...channel, blocked: isMuted });
        if (result) setIsMuted(!isMuted);
    };

    return <ToggleMutedButton {...rest} isMuted={isMuted} loading={loading} onClick={onToggle} />;
});
