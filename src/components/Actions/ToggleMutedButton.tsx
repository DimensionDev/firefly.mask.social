import { t } from '@lingui/macro';
import { useMemo, useRef } from 'react';
import { useHover } from 'usehooks-ts';

import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';

enum MuteLabel {
    Mute = 'Mute',
    Unmute = 'Unmute',
    Muted = 'Muted',
}

interface Props extends Omit<ClickableButtonProps, 'children'> {
    loading: boolean;
    isMuted: boolean;
}

export function ToggleMutedButton({ loading, isMuted, className, ...rest }: Props) {
    const hoverRef = useRef<HTMLButtonElement>(null);
    const isHover = useHover(hoverRef);
    const buttonState = isHover ? MuteLabel.Unmute : MuteLabel.Muted;

    const buttonText = useMemo(() => {
        if (isMuted) {
            if (loading) return t`Unmuting...`;
            return isHover ? t`Unmute` : t`Muted`;
        } else {
            return loading ? t`Muting...` : t`Mute`;
        }
    }, [isHover, isMuted, loading]);

    return (
        <ClickableButton
            ref={hoverRef}
            className={classNames(
                'flex h-8 min-w-[100px] items-center justify-center rounded-full border-danger text-[15px] font-semibold transition-all',
                buttonState === MuteLabel.Muted ? 'border' : '',
                buttonState === MuteLabel.Unmute ? 'border border-danger border-opacity-50' : '',
                isMuted ? 'bg-danger text-white' : 'text-danger',
                className,
            )}
            {...rest}
            disabled={loading}
        >
            {buttonText}
        </ClickableButton>
    );
}
