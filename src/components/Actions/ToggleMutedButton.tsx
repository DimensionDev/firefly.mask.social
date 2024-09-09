import { t } from '@lingui/macro';
import { useMemo, useRef } from 'react';
import { useHover } from 'usehooks-ts';

import MuteIcon from '@/assets/mute.svg';
import UnmuteIcon from '@/assets/unmute.svg';
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
    variant?: 'text' | 'icon';
}

export function ToggleMutedButton({ loading, isMuted, className, variant = 'text', ...rest }: Props) {
    const hoverRef = useRef<HTMLButtonElement>(null);
    const isHover = useHover(hoverRef);
    const buttonState = isHover ? MuteLabel.Unmute : MuteLabel.Muted;

    const buttonText = useMemo(() => {
        if (variant === 'icon') {
            if (isMuted) return <UnmuteIcon className="h-4 w-4 flex-shrink-0" />;
            return <MuteIcon className="h-4 w-4 flex-shrink-0" />;
        }
        if (isMuted) {
            if (loading) return t`Unmuting...`;
            return isHover ? t`Unmute` : t`Muted`;
        }
        return loading ? t`Muting...` : t`Mute`;
    }, [isHover, isMuted, loading, variant]);

    return (
        <ClickableButton
            ref={hoverRef}
            className={classNames(
                'flex h-8 min-w-[112px] items-center justify-center rounded-full border-danger text-medium font-semibold transition-all',
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
