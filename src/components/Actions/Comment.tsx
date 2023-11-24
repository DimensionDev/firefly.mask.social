import { i18n } from '@lingui/core';
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
    canComment?: boolean;
}

export const Comment = memo<CommentProps>(function Comment({ count, disabled = false, source, author, canComment }) {
    const { enqueueSnackbar } = useSnackbar();
    const tooltip = useMemo(() => {
        if (count && count > 0) {
            return i18n.t('{count} Comments', {
                count: humanize(count),
            });
        }

        return i18n.t('Comment');
    }, [count]);

    const handleClick = useCallback(() => {
        if (canComment)
            enqueueSnackbar(
                i18n.t('You cannot reply to @{author} on {source}', {
                    author,
                    source,
                }),
                {
                    variant: 'error',
                },
            );
    }, [canComment, author, source, enqueueSnackbar]);

    return (
        <div
            className={classNames('flex items-center space-x-2', {
                'cursor-not-allowed': disabled,
                'opacity-50': disabled,
            })}
        >
            <motion.button
                disabled={disabled}
                whileTap={{ scale: 0.9 }}
                className={'rounded-full p-1.5 text-secondary hover:bg-bg'}
                onClick={(event) => {
                    event.stopPropagation();
                    if (!disabled) handleClick();
                }}
                aria-label="Comment"
            >
                <Tooltip disabled={disabled} placement="top" content={tooltip}>
                    <ReplyIcon width={16} height={16} />
                </Tooltip>
            </motion.button>
            {count ? <span className="text-xs font-medium text-secondary">{nFormatter(count)}</span> : null}
        </div>
    );
});
