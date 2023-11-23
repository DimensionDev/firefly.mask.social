import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { memo, useCallback, useMemo } from 'react';

import ReplyIcon from '@/assets/reply.svg';
import { Tooltip } from '@/components/Tooltip.js';
import type { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { humanize, nFormatter } from '@/helpers/formatCommentCounts.js';

interface CommentProps {
    count?: number;
    disabled?: boolean;
    source: SocialPlatform;
    author: string;
}

export const Comment = memo<CommentProps>(function Comment({ count, disabled, source, author }) {
    const { enqueueSnackbar } = useSnackbar();
    const tooltip = useMemo(() => {
        if (count && count > 0) {
            return `${humanize(count)} Comments`;
        }

        return 'Comment';
    }, [count]);

    const handleClick = useCallback(() => {
        if (disabled)
            enqueueSnackbar(`You cannot reply to @${author} on ${source}`, {
                variant: 'error',
            });
    }, [disabled, author, source, enqueueSnackbar]);

    return (
        <div className="flex items-center space-x-2">
            <motion.button
                whileTap={{ scale: 0.9 }}
                className={classNames('rounded-full p-1.5 text-secondary ', {
                    'hover:bg-bg': !disabled,
                    'opacity-50': !!disabled,
                })}
                onClick={(event) => {
                    event.stopPropagation();
                    handleClick();
                }}
                aria-label="Comment"
            >
                <Tooltip placement="top" content={tooltip}>
                    <ReplyIcon width={16} height={16} />
                </Tooltip>
            </motion.button>
            {count ? <span className="text-xs font-medium text-secondary">{nFormatter(count)}</span> : null}
        </div>
    );
});
