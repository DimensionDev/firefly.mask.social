import { i18n } from '@lingui/core';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { memo, useCallback } from 'react';

import CollectIcon from '@/assets/collect.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';

interface CollectProps {
    count?: number;
    disabled?: boolean;
}
export const Collect = memo<CollectProps>(function Collect({ count, disabled = false }) {
    const { enqueueSnackbar } = useSnackbar();

    const handleClick = useCallback(() => {
        enqueueSnackbar(i18n.t('Collect is coming soon'), {
            variant: 'warning',
        });
    }, [enqueueSnackbar]);
    return (
        <div
            className={classNames('flex items-center space-x-2 text-secondary hover:text-primaryPink', {
                'opacity-50': disabled,
            })}
        >
            <Tooltip content="Act" placement="top" disabled={disabled}>
                <motion.button
                    disabled={disabled}
                    onClick={(event) => {
                        event.stopPropagation();
                        if (!disabled) handleClick();
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
