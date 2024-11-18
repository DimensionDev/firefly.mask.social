import { t } from '@lingui/macro';
import type { HTMLProps } from 'react';

import LeftArrowIcon from '@/assets/left-arrow.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

interface BackButtonProps extends HTMLProps<HTMLButtonElement> {
    size?: number;
    tooltip?: string;
}

export function BackButton({ size = 24, tooltip = t`Back`, ref, ...rest }: BackButtonProps) {
    const isMedium = useIsMedium();

    const button = (
        <ClickableButton {...rest} className={classNames('rounded hover:bg-lightBg', rest.className)}>
            <LeftArrowIcon
                className={classNames('text-main', {
                    'cursor-pointer': !rest.disabled,
                })}
                width={size}
                height={size}
            />
        </ClickableButton>
    );

    return isMedium ? (
        <Tooltip content={tooltip} placement="top">
            {button}
        </Tooltip>
    ) : (
        button
    );
}
