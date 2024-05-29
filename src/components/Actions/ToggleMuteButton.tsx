import { t } from '@lingui/macro';
import { useHover } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';


enum MuteLabel {
    Mute = 'Mute',
    Unmute = 'Unmute',
    Muted = 'Muted',
}
interface ToggleMuteButtonProps extends Omit<ClickableButtonProps, 'children'> {
    loading: boolean;
    isMuted: boolean;
}

export const ToggleMuteButton = ({
    loading,
    isMuted,
    className,
    ...rest
}: ToggleMuteButtonProps) => {
    const hoverableElement = (hovered: boolean) => {
        const buttonText = isMuted
            ? loading ? t`Unmuting` : hovered ? t`Unmute` : t`Muted`
            : loading ? t`Muting` : hovered ? t`Mute` : t`Mute`;
        const buttonState = hovered ? MuteLabel.Unmute : MuteLabel.Muted;

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
            >
                {loading ? <LoadingIcon width={16} height={16} className="mr-2 animate-spin" /> : null}
                {buttonText}
            </ClickableButton>
        );
    };
    const [hoverable] = useHover(hoverableElement);

    return hoverable;
};