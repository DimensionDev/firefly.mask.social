import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { memo, useCallback } from 'react';
import { useCopyToClipboard } from 'react-use';

import ShareIcon from '@/assets/share.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';

interface ShareProps {
    url: string;
    disabled?: boolean;
}
export const Share = memo<ShareProps>(function Collect({ url, disabled = false }) {
    const enqueueSnackbar = useCustomSnackbar();
    const [, copyToClipboard] = useCopyToClipboard();

    const handleClick = useCallback(() => {
        copyToClipboard(url);
        enqueueSnackbar(t`Copied`, {
            variant: 'success',
        });
    }, [enqueueSnackbar, url, copyToClipboard]);

    return (
        <div
            className={classNames('flex flex-auto items-center space-x-2 self-auto justify-self-auto text-main', {
                'opacity-50': disabled,
            })}
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
            }}
        >
            <Tooltip content={t`Share`} placement="top" disabled={disabled}>
                <motion.button
                    disabled={disabled}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (disabled) return;
                        handleClick();
                    }}
                    whileTap={{ scale: 0.9 }}
                    className={`
                      rounded-full p-1.5

                      hover:bg-bg
                    `}
                >
                    <ShareIcon width={17} height={16} />
                </motion.button>
            </Tooltip>
        </div>
    );
});
