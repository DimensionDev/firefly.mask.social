import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { memo } from 'react';

import ViewsIcon from '@/assets/views.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';

interface ViewsProps {
    count?: number;
    disabled?: boolean;
}
export const Views = memo<ViewsProps>(function Collect({ count, disabled = false }) {
    return (
        <div
            className={classNames('flex items-center space-x-2 text-main', {
                'opacity-50': disabled,
            })}
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
            }}
        >
            <Tooltip content={t`${nFormatter(count ?? 0)} views`} placement="top" disabled={disabled}>
                <motion.button
                    disabled={disabled}
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                    whileTap={{ scale: 0.9 }}
                    className={`
                      rounded-full p-1.5

                      hover:bg-bg
                    `}
                >
                    <ViewsIcon width={20} height={20} />
                </motion.button>
            </Tooltip>
            {count ? <span className="text-xs font-medium">{nFormatter(count)}</span> : null}
        </div>
    );
});
