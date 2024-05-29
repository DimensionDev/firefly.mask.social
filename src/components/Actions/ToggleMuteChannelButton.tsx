import { t, Trans } from '@lingui/macro';
import { memo } from 'react';
import { useToggle } from 'react-use';

import { ToggleMuteButton } from '@/components/Actions/ToggleMuteButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { useToggleBlockChannel } from '@/hooks/useToggleBlockChannel.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface ToggleMuteButtonProps extends Omit<ClickableButtonProps, 'children'> {
    channel: Channel;
    defaultMuted?: boolean;
}

export const ToggleMuteChannelButton = memo(function ToggleMuteChannelButton({
    channel,
    defaultMuted = true,
    ...rest
}: ToggleMuteButtonProps) {
    // FIXME:  we can use channel.blocked instead of defaultMuted
    const [isMuted, setIsMuted] = useToggle(defaultMuted);

    const [{ loading }, toggleBlock] = useToggleBlockChannel();

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
        const result = await toggleBlock({ ...channel, blocked: isMuted });
        if (result) setIsMuted(!isMuted);
    };

    return <ToggleMuteButton {...rest} isMuted={isMuted} loading={loading} onClick={onToggle} />;
});
