import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { memo } from 'react';

import ViewsIcon from '@/assets/views.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';

interface ViewsProps {
    count?: number;
    disabled?: boolean;
}
export const Views = memo<ViewsProps>(function Collect({ count = 0, disabled = false }) {
    const tooltip = count === 1 ? t`${nFormatter(count)} View` : t`${nFormatter(count)} Views`;
    return (
        <ClickableArea
            className={classNames('flex items-center text-main md:space-x-2', {
                'opacity-50': disabled,
            })}
        >
            <Tooltip content={tooltip} placement="top" disabled={disabled}>
                <motion.button
                    disabled={disabled}
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-bg"
                >
                    <ViewsIcon width={20} height={20} />
                </motion.button>
            </Tooltip>
            {count ? <span className="text-xs font-medium">{nFormatter(count)}</span> : null}
        </ClickableArea>
    );
});
