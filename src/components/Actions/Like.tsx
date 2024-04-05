import { t } from '@lingui/macro';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { produce } from 'immer';
import { memo } from 'react';
import { useAsyncFn } from 'react-use';

import LikeIcon from '@/assets/like.svg';
import LikedIcon from '@/assets/liked.svg';
import LoadingIcon from '@/assets/loading.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tooltip } from '@/components/Tooltip.js';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { LoginModalRef } from '@/modals/controls.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface LikeProps {
    postId: string;
    source: SocialPlatform;
    count?: number;
    hasLiked?: boolean;
    disabled?: boolean;
    authorId?: string;
}

function togglePostLikeQueryData(queryClient: QueryClient, source: SocialPlatform, postId: string) {
    queryClient.setQueryData<Post>([source, 'post-detail', postId], (old) => {
        if (!old) return old;
        return produce(old, (draft) => {
            draft.hasLiked = !draft.hasLiked;
        });
    });

    queryClient.setQueriesData<{ pages: Array<{ data: Post[] }> }>({ queryKey: ['posts', source] }, (old) => {
        if (!old) return old;

        return produce(old, (draft) => {
            for (const page of draft.pages) {
                for (const post of page.data) {
                    if (post.postId === postId) {
                        post.hasLiked = !post.hasLiked;
                        post.stats = {
                            ...post.stats,
                            comments: post.stats?.comments || 0,
                            mirrors: post.stats?.mirrors || 0,
                            reactions: (post.stats?.reactions || 0) + (post.hasLiked ? 1 : -1),
                        };
                        return;
                    }
                }
            }
        });
    });
}

export const Like = memo<LikeProps>(function Like({ count, hasLiked, postId, authorId, source, disabled = false }) {
    const isLogin = useIsLogin(source);
    const queryClient = useQueryClient();

    const [{ loading }, handleClick] = useAsyncFn(async () => {
        if (!postId) return null;

        if (!isLogin) {
            if (source === SocialPlatform.Lens) await getWalletClientRequired();
            LoginModalRef.open({ source });
            return;
        }

        try {
            const provider = resolveSocialMediaProvider(source);
            await (hasLiked
                ? provider?.unvotePost(postId, Number(authorId))
                : provider?.upvotePost(postId, Number(authorId)));

            enqueueSuccessMessage(hasLiked ? t`Unliked` : t`Liked`);
            togglePostLikeQueryData(queryClient, source, postId);

            return;
        } catch (error) {
            if (error instanceof Error) {
                enqueueErrorMessage(hasLiked ? t`Failed to unlike.` : t`Failed to like.`);
            }
            return;
        }
    }, [postId, source, hasLiked, queryClient, isLogin, authorId]);

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
                    className="rounded-full p-1.5 hover:bg-danger/[.20]"
                >
                    {loading ? (
                        <LoadingIcon width={16} height={16} className="animate-spin text-danger" />
                    ) : hasLiked ? (
                        <LikedIcon width={16} height={16} />
                    ) : (
                        <LikeIcon width={16} height={16} />
                    )}
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
