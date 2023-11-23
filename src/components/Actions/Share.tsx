import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { memo, useCallback } from 'react';
import { useCopyToClipboard } from 'react-use';

import ShareIcon from '@/assets/share.svg';
import { Tooltip } from '@/components/Tooltip.js';

interface CollectProps {
    url: string;
}
export const Share = memo<CollectProps>(function Collect({ url }) {
    const { enqueueSnackbar } = useSnackbar();
    const [, copyToClipboard] = useCopyToClipboard();

    const handleClick = useCallback(() => {
        copyToClipboard(url);
        enqueueSnackbar('Copied', {
            variant: 'success',
        });
    }, [enqueueSnackbar, url, copyToClipboard]);

    return (
        <div className="flex items-center space-x-2 text-secondary">
            <Tooltip content="Share" placement="top">
                <motion.button
                    onClick={(event) => {
                        event.stopPropagation();
                        handleClick();
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="rounded-full p-1.5 "
                >
                    <ShareIcon width={17} height={16} />
                </motion.button>
            </Tooltip>
        </div>
    );
});
