import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { memo } from 'react';

import TipsIcon from '@/assets/tips.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tooltip } from '@/components/Tooltip.js';
import type { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { TipsModalRef } from '@/modals/controls.js';

interface TipsProps {
    identity: string;
    source: Source;
    disabled?: boolean;
    handle?: string;
    label?: string;
    tooltipDisabled?: boolean;
    pureWallet?: boolean;
    onClick?: () => void;
}

export const Tips = memo(function Tips({
    identity,
    source,
    disabled = false,
    label,
    tooltipDisabled = false,
    pureWallet = false,
    handle,
    onClick,
}: TipsProps) {
    const handleClick = () => {
        TipsModalRef.open({ identity, source, handle: handle ?? null, pureWallet });
        onClick?.();
    };

    return (
        <ClickableArea
            className={classNames('flex cursor-pointer items-center text-main md:space-x-2', {
                'opacity-50': disabled,
                'hover:text-secondarySuccess': !disabled && !label,
                'w-min': !label,
            })}
        >
            <Tooltip className="w-full" content={t`Tips`} placement="top" disabled={disabled || tooltipDisabled}>
                <motion.button
                    className={classNames('inline-flex items-center', {
                        'hover:bg-secondarySuccess/[.20]': !disabled && !label,
                        'cursor-not-allowed': disabled,
                        'h-7 w-7 justify-center rounded-full': !label,
                        'w-full': !!label,
                    })}
                    whileTap={!label ? { scale: 0.9 } : undefined}
                    disabled={disabled}
                    onClick={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        if (disabled) return;
                        handleClick();
                    }}
                >
                    <TipsIcon width={18} height={18} />
                    {label ? <span className="ml-2 font-bold text-main">{label}</span> : null}
                </motion.button>
            </Tooltip>
        </ClickableArea>
    );
});
