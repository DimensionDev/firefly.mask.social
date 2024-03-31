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
        <ClickableButton {...props}>
            <Tooltip content={tooltip} placement="top">
                <CloseIcon
                    className={classNames('text-main', {
                        'cursor-pointer': !props.disabled,
                    })}
                    width={size}
                    height={size}
                />
            </Tooltip>
        </ClickableButton>
    );
}
