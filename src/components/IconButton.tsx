import { t } from '@lingui/macro';
import type { ReactNode } from 'react';

import CloseIcon from '@/assets/close.svg';
import CloseCircleIcon from '@/assets/close-circle.svg';
import MoreIcon from '@/assets/more.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';

interface IconButtonProps extends ClickableButtonProps {
    size?: number;
    tooltip?: string;
    children?: ReactNode;
}

function IconButton({ size = 24, tooltip, children, ref, ...props }: IconButtonProps) {
    return (
        <Tooltip content={tooltip} placement="top">
            <ClickableButton {...props} className={classNames('rounded p-1 hover:bg-lightBg', props.className)}>
                {children}
            </ClickableButton>
        </Tooltip>
    );
}

export function MoreButton({ size = 24, tooltip = t`More`, ref, ...props }: IconButtonProps) {
    return (
        <IconButton tooltip={t`More`} {...props}>
            <MoreIcon
                className={classNames('text-main', {
                    'cursor-pointer': !props.disabled,
                })}
                width={size}
                height={size}
            />
        </IconButton>
    );
}

export function CloseButton({ size = 24, tooltip = t`Close`, ref, ...props }: IconButtonProps) {
    return (
        <IconButton tooltip={t`Close`} {...props}>
            <CloseIcon
                className={classNames('text-main', {
                    'cursor-pointer': !props.disabled,
                })}
                width={size}
                height={size}
            />
        </IconButton>
    );
}

export function ClearButton({ size = 24, tooltip = t`Clear`, ref, ...props }: IconButtonProps) {
    return (
        <IconButton tooltip="Clear" {...props}>
            <CloseCircleIcon width={size} height={size} className="text-inherit" />
        </IconButton>
    );
}
