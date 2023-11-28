import { i18n } from '@lingui/core';
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
            className={classNames('flex items-center space-x-2 text-secondary', {
                'opacity-50': disabled,
            })}
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
            }}
        >
            <Tooltip
                content={
                    count
                        ? i18n.t('{count} views', {
                              count: nFormatter(count),
                          })
                        : null
                }
                placement="top"
                disabled={disabled}
            >
                <motion.button
                    disabled={disabled}
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                    whileTap={{ scale: 0.9 }}
                    className=" rounded-full p-1.5"
                >
                    <ViewsIcon width={17} height={16} />
                </motion.button>
            </Tooltip>
            {count ? <span className="text-xs font-medium">{nFormatter(count)}</span> : null}
        </div>
    );
});
