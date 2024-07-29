import { t } from '@lingui/macro';

import CloseIcon from '@/assets/close.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';

interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    tooltip?: string;
    size?: number;
    onClick?: () => void;
}

export function CloseButton({ size = 24, tooltip = t`Close`, ...props }: CloseButtonProps) {
    return (
        <Tooltip content={tooltip} placement="top">
            <ClickableButton {...props} className={classNames('rounded p-1 hover:bg-lightBg', props.className)}>
                <CloseIcon
                    className={classNames('text-main', {
                        'cursor-pointer': !props.disabled,
                    })}
                    width={size}
                    height={size}
                />
            </ClickableButton>
        </Tooltip>
    );
}
