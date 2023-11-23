import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { memo, useCallback } from 'react';

import CollectIcon from '@/assets/collect.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';

interface CollectProps {
    count?: number;
}
export const Collect = memo<CollectProps>(function Collect({ count }) {
    const { enqueueSnackbar } = useSnackbar();

    const handleClick = useCallback(() => {
        enqueueSnackbar('Collect is coming soon', {
            variant: 'warning',
        });
    }, [enqueueSnackbar]);
    return (
        <div className="flex items-center space-x-2 text-secondary hover:text-primaryPink">
            <Tooltip content="Act" placement="top">
                <motion.button
                    onClick={(event) => {
                        event.stopPropagation();
                        handleClick();
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="rounded-full  p-1.5 hover:bg-primaryPink/[.20] "
                >
                    <CollectIcon width={17} height={16} />
                </motion.button>
            </Tooltip>
            {count ? <span className="text-xs font-medium">{nFormatter(count)}</span> : null}
        </div>
    );
});
