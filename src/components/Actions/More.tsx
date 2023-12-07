import { Menu, Transition } from '@headlessui/react';
import { Select } from '@lingui/macro';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { Fragment, memo, useState } from 'react';
import { useAsyncFn } from 'react-use';

import FollowUserIcon from '@/assets/follow-user.svg';
import LoadingIcon from '@/assets/loading.svg';
import MoreIcon from '@/assets/more.svg';
import UnFollowUserIcon from '@/assets/unfollow-user.svg';
import { SocialPlatform } from '@/constants/enum.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { queryClient } from '@/maskbook/packages/shared-base-ui/src/index.js';
import { LoginModalRef } from '@/modals/controls.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';

interface MoreProps {
    post: Post;
}

export const MoreAction = memo<MoreProps>(function More({ post }) {
    const [isFollowed, setIsFollowed] = useState(post.author.viewerContext?.followedBy ?? false);

    const isLogin = useIsLogin(post.source);

    const { enqueueSnackbar } = useSnackbar();

    const [{ loading }, handleClick] = useAsyncFn(async () => {
        if (!post.author.profileId) return;
        if (!isLogin) {
            LoginModalRef.open();
            return;
        }
        setIsFollowed((prev) => !prev);
        try {
            switch (post.source) {
                case SocialPlatform.Lens:
                    await (isFollowed
                        ? LensSocialMediaProvider.unfollow(post.author.profileId)
                        : LensSocialMediaProvider.follow(post.author.profileId));
                    break;
                case SocialPlatform.Farcaster:
                    await (isFollowed
                        ? WarpcastSocialMediaProvider.unfollow(post.author.profileId)
                        : await WarpcastSocialMediaProvider.follow(post.author.profileId));
                    break;
                default:
                    return;
            }
            enqueueSnackbar(
                <Select
                    value={isFollowed ? 'unfollow' : 'follow'}
                    _follow={`Followed @${post.author.handle} on ${post.source}`}
                    _unfollow={`UnFollowed @${post.author.handle} on ${post.source}`}
                    other={`Followed @${post.author.handle} on ${post.source}`}
                />,
                {
                    variant: 'success',
                },
            );
            queryClient.invalidateQueries({ queryKey: [post.source, 'post-detail', post.postId] });
            queryClient.invalidateQueries({ queryKey: ['discover', post.source] });
            return;
        } catch (error) {
            if (error instanceof Error) {
                enqueueSnackbar(
                    <Select
                        value={isFollowed ? 'unfollow' : 'follow'}
                        _follow={`Failed to followed @${post.author.handle} on ${post.source}`}
                        _unfollow={`Failed to unfollowed @${post.author.handle} on ${post.source}`}
                        other={`Failed to followed @${post.author.handle} on ${post.source}`}
                    />,
                    {
                        variant: 'error',
                    },
                );
                setIsFollowed((prev) => !prev);
            }
        }
    }, [post, isFollowed, isLogin]);

    return (
        <Menu as="div">
            <Menu.Button
                disabled={!isLogin}
                whileTap={{ scale: 0.9 }}
                as={motion.button}
                className="flex items-center text-secondary"
                aria-label="More"
                onClick={(event) => {
                    if (!isLogin) {
                        event.stopPropagation();
                        event.preventDefault();
                        LoginModalRef.open();
                        return;
                    }
                    event.stopPropagation();
                    return;
                }}
            >
                {loading ? (
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                ) : (
                    <MoreIcon width={24} height={24} />
                )}
            </Menu.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute z-[1000] w-max space-y-2 overflow-hidden rounded-2xl bg-primaryBottom text-main shadow-messageShadow hover:text-main">
                    <Menu.Item>
                        {({ close }) => (
                            <div className="flex cursor-pointer items-center space-x-2 p-4 hover:bg-bg">
                                {isFollowed ? (
                                    <UnFollowUserIcon width={24} height={24} />
                                ) : (
                                    <FollowUserIcon width={24} height={24} />
                                )}
                                <span
                                    className="text-[17px] font-bold leading-[22px] text-main"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        event.preventDefault();
                                        close();
                                        handleClick();
                                    }}
                                >
                                    <Select
                                        value={isFollowed ? 'unfollow' : 'follow'}
                                        _follow="Follow"
                                        _unfollow="Unfollow"
                                        other="Follow"
                                    />{' '}
                                    @{post.author.handle}
                                </span>
                            </div>
                        )}
                    </Menu.Item>
                </Menu.Items>
            </Transition>
        </Menu>
    );
});
