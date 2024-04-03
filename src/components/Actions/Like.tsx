import { t } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { memo, useState } from 'react';
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

interface LikeProps {
    postId: string;
    source: SocialPlatform;
    count?: number;
    hasLiked?: boolean;
    disabled?: boolean;
    authorId?: string;
}

export const Like = memo<LikeProps>(function Like({ count, hasLiked, postId, authorId, source, disabled = false }) {
    const isLogin = useIsLogin(source);
    const queryClient = useQueryClient();
    const [liked, setLiked] = useState(hasLiked);
    const [realCount, setRealCount] = useState(count);

    const [{ loading }, handleClick] = useAsyncFn(async () => {
        if (!postId) return null;

        if (!isLogin) {
            if (source === SocialPlatform.Lens) await getWalletClientRequired();
            LoginModalRef.open({ source });
            return;
        }

        const originalCount = count;
        setLiked((prev) => !prev);
        setRealCount((prev) => {
            if (liked && prev) return prev - 1;
            return (prev ?? 0) + 1;
        });
        try {
            const provider = resolveSocialMediaProvider(source);
            await (liked
                ? provider?.unvotePost(postId, Number(authorId))
                : provider?.upvotePost(postId, Number(authorId)));

            enqueueSuccessMessage(liked ? t`Unliked` : t`Liked`);
            queryClient.invalidateQueries({ queryKey: [source, 'post-detail', postId] });
            queryClient.invalidateQueries({ queryKey: ['discover', source] });

            return;
        } catch (error) {
            if (error instanceof Error) {
                setRealCount(originalCount);
                enqueueErrorMessage(
                    liked ? t`Failed to unlike. ${error.message}` : t`Failed to like. ${error.message}`,
                );
                setLiked((prev) => !prev);
            }
            return;
        }
    }, [postId, source, liked, queryClient, isLogin, realCount, authorId]);

    return (
        <ClickableArea
            className={classNames('flex cursor-pointer items-center text-main hover:text-danger md:space-x-2', {
                'font-bold text-danger': !!liked,
                'opacity-50': disabled,
            })}
            onClick={() => {
                if (disabled) return;
                handleClick();
            }}
        >
            <Tooltip content={liked ? t`Unlike` : t`Like`} placement="top" disabled={disabled}>
                <motion.button
                    disabled={disabled}
                    whileTap={{ scale: 0.9 }}
                    className="rounded-full p-1.5 hover:bg-danger/[.20]"
                >
                    {loading ? (
                        <LoadingIcon width={16} height={16} className="animate-spin text-danger" />
                    ) : liked ? (
                        <LikedIcon width={17} height={16} />
                    ) : (
                        <LikeIcon width={17} height={16} />
                    )}
                </motion.button>
            </Tooltip>
            {realCount ? (
                <span
                    className={classNames('text-xs', {
                        'font-bold text-danger': !!liked,
                    })}
                >
                    {nFormatter(realCount)}
                </span>
            ) : null}
        </ClickableArea>
    );
});
