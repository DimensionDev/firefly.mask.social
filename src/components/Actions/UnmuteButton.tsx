import { t, Trans } from '@lingui/macro';
import { memo, useState } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useIsMuted } from '@/hooks/useIsMuted.js';
import { useToggleBlock } from '@/hooks/useToggleBlock.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

enum MuteLabel {
    Mute = 'Mute',
    Unmute = 'Unmute',
    Muted = 'Muted',
}

interface UnmuteButtonProps extends Omit<ClickableButtonProps, 'children'> {
    profile: Profile;
}

export const UnmuteButton = memo(function UnmuteButton({ profile, className, ...rest }: UnmuteButtonProps) {
    const [muteHover, setMuteHover] = useState(false);

    const currentProfile = useCurrentProfile(profile.source);
    const [{ loading }, toggleBlock] = useToggleBlock(currentProfile);
    const buttonText = loading ? t`Unmuting` : muteHover ? t`Unmute` : t`Muted`;
    const buttonState = muteHover ? MuteLabel.Unmute : MuteLabel.Muted;

    const muted = useIsMuted(profile);
    if (!muted) return null;

    return (
        <ClickableButton
            className={classNames(
                ' flex h-8 min-w-[100px] items-center justify-center rounded-full border-danger bg-danger px-2 text-[15px] font-semibold text-white transition-all disabled:cursor-not-allowed  disabled:opacity-50',
                buttonState === MuteLabel.Muted ? 'border-[1.5px]' : '',
                buttonState === MuteLabel.Unmute ? 'border-[1.5px] border-danger border-opacity-50' : '',
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
            onClick={async () => {
                const confirmed = await ConfirmModalRef.openAndWaitForClose({
                    title: t`Unmute @${profile.handle}`,
                    content: (
                        <div className="text-main">
                            <Trans>Confirm you want to unmute @{profile.handle}?</Trans>
                        </div>
                    ),
                });
                if (!confirmed) return;
                toggleBlock(profile);
            }}
        >
            {loading ? <LoadingIcon width={16} height={16} className="mr-2 animate-spin" /> : null}
            {buttonText}
        </ClickableButton>
    );
});
