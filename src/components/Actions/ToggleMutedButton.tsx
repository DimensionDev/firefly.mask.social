import { t } from '@lingui/macro';
import { useMemo, useRef } from 'react';
import { useHover } from 'usehooks-ts';

import LoadingIcon from '@/assets/loading.svg';
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
            if (loading) return `Unmuting`;
            return isHover ? t`Unmute` : t`Muted`;
        } else {
            return loading ? t`Muting` : t`Mute`;
        }
    }, [isHover, isMuted, loading]);

    return (
        <ClickableButton
            ref={hoverRef}
            className={classNames(
                'flex h-8 min-w-[100px] items-center justify-center rounded-full border-danger px-2 text-[15px] font-semibold transition-all',
                buttonState === MuteLabel.Muted ? 'border-[1.5px]' : '',
                buttonState === MuteLabel.Unmute ? 'border-[1.5px] border-danger border-opacity-50' : '',
                isMuted ? 'bg-danger text-white' : 'text-danger',
                className,
            )}
            {...rest}
            disabled={loading}
        >
            {loading ? <LoadingIcon width={16} height={16} className="mr-2 animate-spin" /> : null}
            {buttonText}
        </ClickableButton>
    );
}
