import { t } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { memo, useState } from 'react';
import { useAsyncFn } from 'react-use';

import LikeIcon from '@/assets/like.svg';
import LikedIcon from '@/assets/liked.svg';
import LoadingIcon from '@/assets/loading.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { useLogin } from '@/hooks/useLogin.js';
import { LoginModalRef } from '@/modals/controls.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';

interface LikeProps {
    postId: string;
    source: SocialPlatform;
    count?: number;
    hasLiked?: boolean;
    disabled?: boolean;
}

export const Like = memo<LikeProps>(function Like({ count, hasLiked, postId, source, disabled = false }) {
    const isLogin = useLogin(source);
    const queryClient = useQueryClient();
    const [liked, setLiked] = useState(hasLiked);
    const [realCount, setRealCount] = useState(count);

    const { enqueueSnackbar } = useSnackbar();
    const [{ loading }, handleClick] = useAsyncFn(async () => {
        if (!postId) return null;
        if (!isLogin) {
            LoginModalRef.open({});
            return;
        }
        setLiked((prev) => !prev);
        setRealCount((prev) => (prev ?? 0) + 1);
        try {
            switch (source) {
                case SocialPlatform.Lens:
                    await (liked
                        ? LensSocialMediaProvider.unvotePost(postId)
                        : LensSocialMediaProvider.upvotePost(postId));
                    break;
                case SocialPlatform.Farcaster:
                    await (liked
                        ? FireflySocialMediaProvider.unvotePost(postId)
                        : FireflySocialMediaProvider.upvotePost(postId));
                    break;
                default:
                    break;
            }
            enqueueSnackbar(liked ? t`UnLiked` : t`Liked`, {
                variant: 'success',
            });
            queryClient.invalidateQueries({ queryKey: [source, 'post-detail', postId] });
            queryClient.invalidateQueries({ queryKey: ['discover', source] });

            return;
        } catch (error) {
            if (error instanceof Error) {
                setRealCount((prev) => {
                    if (!prev) return;
                    return prev - 1;
                });
                enqueueSnackbar(liked ? t`Failed to unlike. ${error.message}` : t`Failed to like. ${error.message}`, {
                    variant: 'error',
                });
                setLiked((prev) => !prev);
            }
            return;
        }
    }, [postId, source, liked, queryClient, isLogin]);

    return (
        <div
            className={classNames('flex items-center space-x-2 text-secondary hover:text-danger', {
                'font-bold': !!liked,
                'text-danger': !!liked,
                'opacity-50': disabled,
            })}
        >
            <Tooltip content={liked ? t`UnLike` : t`Like`} placement="top" disabled={disabled}>
                <motion.button
                    disabled={disabled}
                    whileTap={{ scale: 0.9 }}
                    className="rounded-full p-1.5 hover:bg-danger/[.20] "
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (disabled) return;
                        handleClick();
                    }}
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
            {realCount ? <span className="text-xs">{nFormatter(realCount)}</span> : null}
        </div>
    );
});
