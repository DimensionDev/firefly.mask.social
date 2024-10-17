import { t } from '@lingui/macro';
import type { HTMLProps } from 'react';

import LeftArrowIcon from '@/assets/left-arrow.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';

interface BackButtonProps extends HTMLProps<HTMLButtonElement> {
    size?: number;
    tooltip?: string;
}

export function BackButton({ size = 24, tooltip = t`Back`, ref, ...props }: BackButtonProps) {
    return (
        <Tooltip content={tooltip} placement="top">
            <ClickableButton {...props} className={classNames('rounded hover:bg-lightBg', props.className)}>
                <LeftArrowIcon
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
