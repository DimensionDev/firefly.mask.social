import { Menu, Transition } from '@headlessui/react';
import { Select } from '@lingui/macro';
import { motion } from 'framer-motion';
import { Fragment, memo, useState } from 'react';
import { useAsyncFn } from 'react-use';

import FollowUserIcon from '@/assets/follow-user.svg';
import LoadingIcon from '@/assets/loading.svg';
import MoreIcon from '@/assets/more.svg';
import UnFollowUserIcon from '@/assets/unfollow-user.svg';
import { queryClient } from '@/configs/queryClient.js';
import { useIsFollowing } from '@/hooks/useIsFollowing.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useToggleFollow } from '@/hooks/useToggleFollow.js';
import { LoginModalRef } from '@/modals/controls.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface MoreProps {
    post: Post;
}

export const MoreAction = memo<MoreProps>(function MoreAction({ post }) {
    const isFollowed = !!post.author.viewerContext?.followedBy;
    const [touched, setTouched] = useState(false);

    const [isFollowing, refresh] = useIsFollowing({
        profile: post.author,
        placeholder: !!post.author.viewerContext?.followedBy,
        enabled: touched,
    });

    const isLogin = useIsLogin(post.source);

    const [, handleToggleFollow] = useToggleFollow(post.author, isFollowing);
    const [{ loading }, handleToggle] = useAsyncFn(async () => {
        await handleToggleFollow();
        setTouched(true);
        await refresh();
    }, [handleToggleFollow, refresh]);

    return (
        <Menu as="div">
            <Menu.Button
                whileTap={{ scale: 0.9 }}
                as={motion.button}
                className="flex items-center text-secondary"
                aria-label="More"
                onClick={(event) => {
                    if (!isLogin) {
                        event.stopPropagation();
                        event.preventDefault();
                        LoginModalRef.open({ source: post.source });
                        return;
                    }
                    event.stopPropagation();
                    return;
                }}
            >
                {loading ? (
                    <span className="inline-flex h-6 w-6 animate-spin items-center justify-center">
                        <LoadingIcon width={16} height={16} />
                    </span>
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
                                    onClick={async (event) => {
                                        event.stopPropagation();
                                        event.preventDefault();
                                        close();
                                        await handleToggle();
                                        queryClient.invalidateQueries({
                                            queryKey: [post.source, 'post-detail', post.postId],
                                        });
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
