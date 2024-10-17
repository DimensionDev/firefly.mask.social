import { t } from '@lingui/macro';
import type { HTMLProps } from 'react';

import CloseIcon from '@/assets/close.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';

interface RemoveButtonProps extends HTMLProps<HTMLButtonElement> {
    tooltip?: string;
    size?: number;
}

export function RemoveButton({ size = 18, tooltip = t`Remove`, ref, ...props }: RemoveButtonProps) {
    return (
        <Tooltip content={tooltip} placement="top">
            <ClickableButton
                {...props}
                className={classNames(
                    props.className,
                    'inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-500 md:group-hover:inline-flex',
                )}
            >
                <CloseIcon
                    className={classNames('text-white', {
                        'cursor-pointer': !props.disabled,
                    })}
                    width={size}
                    height={size}
                />
            </ClickableButton>
        </Tooltip>
    );
}
