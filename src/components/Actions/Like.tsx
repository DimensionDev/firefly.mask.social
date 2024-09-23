import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { memo, useCallback } from 'react';

import LikeIcon from '@/assets/like.svg';
import LikedIcon from '@/assets/liked.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { LoginModalRef } from '@/modals/controls.js';
import { capturePostActionEvent } from '@/providers/safary/capturePostActionEvent.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface LikeProps {
    post: Post;
    disabled?: boolean;
    isComment: boolean;
    hiddenCount?: boolean;
}

export const Like = memo<LikeProps>(function Like({ post, disabled = false, hiddenCount = false, isComment }) {
    const { author, postId, source, hasLiked } = post;

    const isLogin = useIsLogin(source);

    const handleClick = useCallback(async () => {
        if (!postId) return null;

        if (!isLogin) {
            LoginModalRef.open({ source });
            return;
        }

        try {
            const provider = resolveSocialMediaProvider(source);
            const promise = hasLiked
                ? provider.unvotePost(postId, Number(author.profileId))
                : provider.upvotePost(postId, Number(author.profileId));

            await promise;

            capturePostActionEvent(hasLiked ? 'unlike' : 'like', post);
            enqueueSuccessMessage(hasLiked ? t`Unliked` : t`Liked`);
            return;
        } catch (error) {
            if (isComment) {
                enqueueErrorMessage(
                    getSnackbarMessageFromError(
                        error,
                        hasLiked ? t`Failed to unlike the comment.` : t`Failed to like the comment.`,
                    ),
                    {
                        error,
                    },
                );
            } else {
                enqueueErrorMessage(
                    getSnackbarMessageFromError(
                        error,
                        hasLiked ? t`Failed to unlike the post.` : t`Failed to like the post.`,
                    ),
                    {
                        error,
                    },
                );
            }
            throw error;
        }
    }, [postId, source, hasLiked, isLogin, author.profileId, post, isComment]);

    return (
        <ClickableArea
            className={classNames(
                'flex w-min cursor-pointer items-center text-lightSecond hover:text-danger md:space-x-2',
                {
                    'font-bold text-danger': !!hasLiked,
                    'opacity-50': disabled,
                },
            )}
            onClick={() => {
                if (disabled) return;
                handleClick();
            }}
        >
            <Tooltip content={hasLiked ? t`Unlike` : t`Like`} placement="top" disabled={disabled}>
                <motion.button
                    disabled={disabled}
                    whileTap={{ scale: 0.9 }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-danger/[.20]"
                >
                    {hasLiked ? <LikedIcon width={16} height={16} /> : <LikeIcon width={16} height={16} />}
                </motion.button>
            </Tooltip>
            {!hiddenCount && post.stats?.reactions ? (
                <span
                    className={classNames('text-xs', {
                        'font-bold text-danger': !!hasLiked,
                    })}
                >
                    {nFormatter(post.stats?.reactions)}
                </span>
            ) : null}
        </ClickableArea>
    );
});
