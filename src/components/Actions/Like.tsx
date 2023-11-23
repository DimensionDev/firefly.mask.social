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
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';

interface LikeProps {
    postId: string;
    source: SocialPlatform;
    count?: number;
    hasLiked?: boolean;
}

export const Like = memo<LikeProps>(function Like({ count, hasLiked, postId, source }) {
    const queryClient = useQueryClient();
    const [liked, setLiked] = useState(hasLiked);
    const [realCount, setRealCount] = useState(count);

    const { enqueueSnackbar } = useSnackbar();
    const [{ loading }, handleClick] = useAsyncFn(async () => {
        if (!postId) return null;
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
            enqueueSnackbar(liked ? 'Unliked' : 'Liked', {
                variant: 'success',
            });
            queryClient.invalidateQueries({ queryKey: [source, 'post-detail', postId] });
            queryClient.invalidateQueries({ queryKey: ['discover', source] });

            return;
        } catch (error) {
            if (error instanceof Error) {
                setLiked((prev) => !prev);
                setRealCount((prev) => {
                    if (!prev) return;
                    return prev - 1;
                });
                enqueueSnackbar(`'Failed to ${liked ? 'unlike' : 'like'}. ${error.message}`, {
                    variant: 'error',
                });
            }
            return;
        }
    }, [postId, source, liked, queryClient]);

    return (
        <div
            className={classNames('flex items-center space-x-2 text-secondary hover:text-danger', {
                'font-bold': !!liked,
                'text-danger': !!liked,
            })}
        >
            <Tooltip content={hasLiked ? 'Unlike' : 'Like'} placement="top">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="rounded-full  p-1.5 hover:bg-danger/[.20] "
                    onClick={(event) => {
                        event.stopPropagation();
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
