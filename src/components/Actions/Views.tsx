import { motion } from 'framer-motion';
import { memo } from 'react';

import ViewsIcon from '@/assets/views.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';

interface CollectProps {
    count?: number;
}
export const Views = memo<CollectProps>(function Collect({ count }) {
    return (
        <div className=" flex items-center space-x-2 text-secondary">
            <Tooltip content={count ? `${nFormatter(count)} views` : null} placement="top">
                <motion.button
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="  rounded-full p-1.5 "
                >
                    <ViewsIcon width={17} height={16} />
                </motion.button>
            </Tooltip>
            {count ? <span className="text-xs font-medium">{nFormatter(count)}</span> : null}
        </div>
    );
});
