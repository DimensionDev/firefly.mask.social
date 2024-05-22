import { t } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { memo, useCallback } from 'react';

import LikeIcon from '@/assets/like.svg';
import LikedIcon from '@/assets/liked.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tooltip } from '@/components/Tooltip.js';
import { config } from '@/configs/wagmiClient.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { toggleLike } from '@/decorators/SetQueryDataForLikePost.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { LoginModalRef } from '@/modals/controls.js';

interface LikeProps {
    postId: string;
    source: SocialSource;
    count?: number;
    hasLiked?: boolean;
    disabled?: boolean;
    authorId?: string;
    isComment: boolean;
}

export const Like = memo<LikeProps>(function Like({
    count,
    hasLiked,
    postId,
    authorId,
    source,
    disabled = false,
    isComment,
}) {
    const isLogin = useIsLogin(source);
    const queryClient = useQueryClient();

    const handleClick = useCallback(async () => {
        if (!postId) return null;

        if (!isLogin) {
            if (source === Source.Lens) await getWalletClientRequired(config);
            LoginModalRef.open({ source });
            return;
        }

        try {
            const provider = resolveSocialMediaProvider(source);
            const promise = hasLiked
                ? provider.unvotePost(postId, Number(authorId))
                : provider.upvotePost(postId, Number(authorId));

            await promise;
            enqueueSuccessMessage(hasLiked ? t`Unliked` : t`Liked`);
            return;
        } catch (error) {
            if (isComment) {
                enqueueErrorMessage(hasLiked ? t`Failed to unlike the comment.` : t`Failed to like the comment.`, {
                    error,
                });
            } else {
                enqueueErrorMessage(hasLiked ? t`Failed to unlike the post.` : t`Failed to like the post.`, {
                    error,
                });
            }
            toggleLike(source, postId, !hasLiked);
            throw error;
        }
    }, [postId, source, hasLiked, queryClient, isLogin, authorId, isComment]);

    return (
        <ClickableArea
            className={classNames('flex cursor-pointer items-center text-main hover:text-danger md:space-x-2', {
                'font-bold text-danger': !!hasLiked,
                'opacity-50': disabled,
            })}
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
            {count ? (
                <span
                    className={classNames('text-xs', {
                        'font-bold text-danger': !!hasLiked,
                    })}
                >
                    {nFormatter(count)}
                </span>
            ) : null}
        </ClickableArea>
    );
});
