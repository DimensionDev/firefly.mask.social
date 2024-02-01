import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { memo, useState } from 'react';
import { useAsyncFn } from 'react-use';

import LikeIcon from '@/assets/like.svg';
import LikedIcon from '@/assets/liked.svg';
import LoadingIcon from '@/assets/loading.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { LoginModalRef } from '@/modals/controls.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';

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

    const enqueueSnackbar = useCustomSnackbar();
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
            switch (source) {
                case SocialPlatform.Lens:
                    await (liked
                        ? LensSocialMediaProvider.unvotePost(postId)
                        : LensSocialMediaProvider.upvotePost(postId));
                    break;
                case SocialPlatform.Farcaster:
                    await (liked
                        ? FarcasterSocialMediaProvider.unvotePost(postId)
                        : FarcasterSocialMediaProvider.upvotePost(postId, Number(authorId)));
                    break;
                default:
                    safeUnreachable(source);
                    break;
            }
            enqueueSnackbar(liked ? t`Unliked` : t`Liked`, {
                variant: 'success',
            });
            queryClient.invalidateQueries({ queryKey: [source, 'post-detail', postId] });
            queryClient.invalidateQueries({ queryKey: ['discover', source] });

            return;
        } catch (error) {
            if (error instanceof Error) {
                setRealCount(originalCount);
                enqueueSnackbar(liked ? t`Failed to unlike. ${error.message}` : t`Failed to like. ${error.message}`, {
                    variant: 'error',
                });
                setLiked((prev) => !prev);
            }
            return;
        }
    }, [postId, source, liked, queryClient, isLogin, realCount, authorId]);

    return (
        <div
            className={classNames('flex cursor-pointer items-center space-x-2 text-main hover:text-danger', {
                'font-bold': !!liked,
                'text-danger': !!liked,
                'opacity-50': disabled,
            })}
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
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
                        'font-bold': !!liked,
                        'text-danger': !!liked,
                    })}
                >
                    {nFormatter(realCount)}
                </span>
            ) : null}
        </div>
    );
});
