import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { memo, useCallback } from 'react';

import ReplyIcon from '@/assets/reply.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { humanize, nFormatter } from '@/helpers/formatCommentCounts.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface CommentProps {
    post: Post;
    disabled?: boolean;
    hiddenCount?: boolean;
}

export const Comment = memo<CommentProps>(function Comment({ post, disabled = false, hiddenCount = false }) {
    const { canComment, source, author } = post;
    const count = post.stats?.comments ?? 0;

    const isLogin = useIsLogin(source);

    const handleClick = useCallback(async () => {
        if (!isLogin) {
            LoginModalRef.open({ source });
            return;
        }
        if (canComment) {
            ComposeModalRef.open({
                type: 'reply',
                post,
                source,
            });
        } else {
            enqueueErrorMessage(t`You cannot reply to @${author.handle} on ${resolveSourceName(source)}.`);
        }
    }, [isLogin, canComment, post, author.handle, source]);

    return (
        <ClickableArea
            className={classNames('flex w-min cursor-pointer items-center space-x-1 md:space-x-2', {
                'cursor-not-allowed opacity-50': disabled,
            })}
            onClick={() => {
                if (!disabled) handleClick();
            }}
        >
            <Tooltip
                disabled={disabled}
                placement="top"
                content={count && count > 0 ? t`${humanize(count)} Comments` : t`Comment`}
            >
                <motion.button
                    disabled={disabled}
                    whileTap={{ scale: 0.9 }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-link/[0.2] hover:text-link focus:outline-none focus-visible:outline-none"
                    aria-label="Comment"
                >
                    <ReplyIcon width={16} height={16} />
                </motion.button>
            </Tooltip>
            {!hiddenCount && count ? <span className="text-xs font-medium text-main">{nFormatter(count)}</span> : null}
        </ClickableArea>
    );
});
