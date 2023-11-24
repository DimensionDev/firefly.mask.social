import { i18n } from '@lingui/core';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { memo, useCallback } from 'react';
import { useCopyToClipboard } from 'react-use';

import ShareIcon from '@/assets/share.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';

interface ShareProps {
    url: string;
    disabled?: boolean;
}
export const Share = memo<ShareProps>(function Collect({ url, disabled = false }) {
    const { enqueueSnackbar } = useSnackbar();
    const [, copyToClipboard] = useCopyToClipboard();

    const handleClick = useCallback(() => {
        copyToClipboard(url);
        enqueueSnackbar(i18n._('Copied'), {
            variant: 'success',
        });
    }, [enqueueSnackbar, url, copyToClipboard]);

    return (
        <div
            className={classNames('flex items-center space-x-2 text-secondary', {
                'opacity-50': disabled,
            })}
        >
            <Tooltip content="Share" placement="top" disabled={disabled}>
                <motion.button
                    disabled={disabled}
                    onClick={(event) => {
                        event.stopPropagation();
                        if (disabled) return;
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
