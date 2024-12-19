import type { HTMLProps, ReactNode } from 'react';

import CloseIcon from '@/assets/close.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';

interface IconButtonProps extends HTMLProps<HTMLButtonElement> {
    tooltip?: string;
    size?: number;
    children?: ReactNode;
}

function IconButton({ size = 24, tooltip, children, ref, ...props }: IconButtonProps) {
    const Button = (
        <ClickableButton {...props} className={classNames('rounded p-1 hover:bg-lightBg', props.className)}>
            {children}
        </ClickableButton>
    );

    if (!tooltip) return Button;
    return (
        <Tooltip content={tooltip} placement="top">
            {Button}
        </Tooltip>
    );
}

interface ButtonProps extends Omit<IconButtonProps, 'children'> {
    IconProps?: HTMLProps<SVGElement>;
}

export function CloseButton({ IconProps, ...rest }: ButtonProps) {
    return (
        <IconButton tooltip={t`Close`} {...rest}>
            <CloseIcon
                {...IconProps}
                className={classNames('text-main', IconProps?.className, {
                    'cursor-pointer': !rest.disabled,
                })}
                width={rest.size}
                height={rest.size}
            />
        </IconButton>
    );
}

import CloseCircleIcon from '@/assets/close-circle.svg';

export function ClearButton({ IconProps, ...rest }: ButtonProps) {
    return (
        <IconButton tooltip={t`Clear`} {...rest}>
            <CloseCircleIcon
                {...IconProps}
                className={classNames('text-main', IconProps?.className, {
                    'cursor-pointer': !rest.disabled,
                })}
                width={rest.size}
                height={rest.size}
            />
        </IconButton>
    );
}

import MoreIcon from '@/assets/more.svg';
import { t } from '@lingui/macro';

export function MoreButton({ IconProps, ...rest }: ButtonProps) {
    return (
        <IconButton tooltip={t`More`} {...rest}>
            <MoreIcon
                className={classNames('text-main', IconProps?.className, {
                    'cursor-pointer': !rest.disabled,
                })}
                width={rest.size}
                height={rest.size}
            />
        </IconButton>
    );
}
