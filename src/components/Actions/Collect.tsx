import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { memo } from 'react';

import CollectIcon from '@/assets/collect.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';

interface CollectProps {
    count?: number;
    disabled?: boolean;
    collected?: boolean;
    hiddenCount?: boolean;
}
export const Collect = memo<CollectProps>(function Collect({
    count,
    disabled = false,
    collected,
    hiddenCount = false,
}) {
    return (
        <ClickableArea
            className={classNames('flex w-min items-center text-main hover:text-primaryPink md:space-x-2', {
                'opacity-50': disabled,
            })}
        >
            <Tooltip content={t`Collect`} placement="top" disabled={disabled}>
                <motion.button
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-primaryPink/[.20]"
                    whileTap={{ scale: 0.9 }}
                    disabled={disabled}
                    onClick={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        if (disabled) return;
                        enqueueErrorMessage(t`Collect Action is not supported yet.`);
                    }}
                >
                    <CollectIcon width={17} height={16} className={collected ? 'text-collected' : ''} />
                </motion.button>
            </Tooltip>
            {!hiddenCount && count ? (
                <span
                    className={classNames('text-xs', {
                        'font-medium': !collected,
                        'font-bold': !!collected,
                        'text-collected': !!collected,
                    })}
                >
                    {nFormatter(count)}
                </span>
            ) : null}
        </ClickableArea>
    );
});
