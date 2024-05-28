import { t, Trans } from '@lingui/macro';
import { memo, useState } from 'react';
import { useToggle } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useToggleBlock } from '@/hooks/useToggleBlock.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

enum MuteLabel {
    Mute = 'Mute',
    Unmute = 'Unmute',
    Muted = 'Muted',
}

interface ToggleMuteUserButtonProps extends Omit<ClickableButtonProps, 'children'> {
    profile: Profile;
    defaultMuted?: boolean;
}

export const ToggleMuteUserButton = memo(function ToggleMuteUserButton({ profile, defaultMuted = true, className, ...rest }: ToggleMuteUserButtonProps) {
    const [muteHover, setMuteHover] = useState(false);
    const [isMuted, setIsMuted] = useToggle(defaultMuted);

    const currentProfile = useCurrentProfile(profile.source);
    const [{ loading }, toggleBlock] = useToggleBlock(currentProfile);

    const onToggle = async () => {
        const confirmed = await ConfirmModalRef.openAndWaitForClose({
            title: t`${isMuted ? 'Unmute' : 'Mute'} @${profile.handle}`,
            content: (
                <div className="text-main">
                    <Trans>Confirm you want to {isMuted ? 'unmute' : 'mute'} @{profile.handle}?</Trans>
                </div>
            ),
        });
        if (!confirmed) return;
        const result = await toggleBlock(profile);
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
