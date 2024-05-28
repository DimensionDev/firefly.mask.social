import { t } from '@lingui/macro';

import LeftArrowIcon from '@/assets/left-arrow.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';

interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    tooltip?: string;
    size?: number;
    onClick?: () => void;
}

export function BackButton({ size = 24, tooltip = t`Back`, ...props }: BackButtonProps) {
    return (
        <ClickableButton {...props}>
            <Tooltip content={tooltip} placement="top">
                <LeftArrowIcon
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
