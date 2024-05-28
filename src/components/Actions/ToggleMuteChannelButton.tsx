import { t, Trans } from '@lingui/macro';
import { memo, useState } from 'react';
import { useToggle } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { useToggleBlockChannel } from '@/hooks/useToggleBlockChannel.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

enum MuteLabel {
    Mute = 'Mute',
    Unmute = 'Unmute',
    Muted = 'Muted',
}

interface ToggleMuteButtonProps extends Omit<ClickableButtonProps, 'children'> {
    channel: Channel;
    defaultMuted?: boolean;
}

export const ToggleMuteChannelButton = memo(function ToggleMuteChannelButton({ channel, defaultMuted = true, className, ...rest }: ToggleMuteButtonProps) {
    const [muteHover, setMuteHover] = useState(false);
    const [isMuted, setIsMuted] = useToggle(defaultMuted);

    const [{ loading }, toggleBlock] = useToggleBlockChannel();

    const onToggle = async () => {
        const confirmed = await ConfirmModalRef.openAndWaitForClose({
            title: t`${isMuted ? 'Unmute' : 'Mute'} /${channel.name}`,
            content: (
                <div className="text-main">
                    <Trans>Confirm you want to {isMuted ? 'unmute' : 'mute'} /{channel.name}?</Trans>
                </div>
            ),
        });
        if (!confirmed) return;
        const result = await toggleBlock({ ...channel, blocked: isMuted });
        if (result) setIsMuted(!isMuted);
    };

    const buttonText = isMuted
        ? loading ? t`Unmuting` : muteHover ? t`Unmute` : t`Muted`
        : loading ? t`Muting` : muteHover ? t`Mute` : t`Mute`;
    const buttonState = muteHover ? MuteLabel.Unmute : MuteLabel.Muted;

    return (
        <ClickableButton
            className={classNames(
                ' flex h-8 min-w-[100px] items-center justify-center rounded-full border-danger px-2 text-[15px] font-semibold transition-all',
                buttonState === MuteLabel.Muted ? 'border-[1.5px]' : '',
                buttonState === MuteLabel.Unmute ? 'border-[1.5px] border-danger border-opacity-50' : '',
                isMuted ? 'bg-danger text-white' : 'text-danger',
                className,
            )}
            {...rest}
            disabled={loading}
            onMouseEnter={() => {
                if (loading) return;
                setMuteHover(true);
            }}
            onMouseLeave={() => {
                if (loading) return;
                setMuteHover(false);
            }}
            onClick={onToggle}
        >
            {loading ? <LoadingIcon width={16} height={16} className="mr-2 animate-spin" /> : null}
            {buttonText}
        </ClickableButton>
    );
});
