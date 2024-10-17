import { t } from '@lingui/macro';
import type { HTMLProps } from 'react';

import CloseCircleIcon from '@/assets/close-circle.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';

interface ClearButtonProps extends HTMLProps<HTMLButtonElement> {
    tooltip?: string;
    size?: number;
}

export function ClearButton({ size = 24, tooltip = t`Clear`, ref, ...props }: ClearButtonProps) {
    return (
        <Tooltip content={tooltip} placement="top">
            <ClickableButton
                {...props}
                className={classNames('rounded p-1 hover:bg-lightBg', props.className, {
                    'cursor-pointer': !props.disabled,
                })}
            >
                <CloseCircleIcon width={size} height={size} className="text-inherit" />
            </ClickableButton>
        </Tooltip>
    );
}
