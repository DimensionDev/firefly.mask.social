import { Menu, Transition } from '@headlessui/react';
import { Select, t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { Fragment, memo } from 'react';
import { Trans } from 'react-i18next';

import FollowUserIcon from '@/assets/follow-user.svg';
import LoadingIcon from '@/assets/loading.svg';
import MoreIcon from '@/assets/more.svg';
import TrashIcon from '@/assets/trash.svg';
import UnFollowUserIcon from '@/assets/unfollow-user.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { queryClient } from '@/configs/queryClient.js';
import { config } from '@/configs/wagmiClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useDeletePost } from '@/hooks/useDeletePost.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useToggleFollow } from '@/hooks/useToggleFollow.js';
import { LoginModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface MoreProps {
    source: SocialPlatform;
    author: Profile;
    id?: string;
}

export const MoreAction = memo<MoreProps>(function MoreAction({ source, author, id }) {
    const isLogin = useIsLogin(source);
    const currentProfile = useCurrentProfile(source);
    const isMyPost = isSameProfile(author, currentProfile);

    const [isFollowed, { loading }, handleToggle] = useToggleFollow(author);

    const [{ loading: deleting }, deletePost] = useDeletePost(source);
    return (
        <Menu className=" relative" as="div">
            <Menu.Button
                whileTap={{ scale: 0.9 }}
                as={motion.button}
                className="flex items-center text-secondary"
                aria-label="More"
                onClick={async (event) => {
                    if (!isLogin) {
                        event.stopPropagation();
                        event.preventDefault();
                        if (source === SocialPlatform.Lens) await getWalletClientRequired(config);
                        LoginModalRef.open({ source });
                    } else {
                        event.stopPropagation();
                    }
                }}
            >
                {loading ? (
                    <span className="inline-flex h-6 w-6 animate-spin items-center justify-center">
                        <LoadingIcon width={16} height={16} />
                    </span>
                ) : (
                    <Tooltip content={t`More`} placement="top">
                        <MoreIcon width={24} height={24} />
                    </Tooltip>
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
                <Menu.Items
                    className="absolute right-0 z-[1000] flex w-max space-y-2 overflow-hidden rounded-2xl border border-line bg-primaryBottom text-main"
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                >
                    {isMyPost ? (
                        <Menu.Item>
                            {({ close }) => (
                                <ClickableButton
                                    className="flex cursor-pointer items-center space-x-2 p-4 hover:bg-bg"
                                    onClick={async () => {
                                        close();
                                        if (id) deletePost(id);
                                    }}
                                >
                                    {deleting ? (
                                        <LoadingIcon width={16} height={16} className="animate-spin text-danger" />
                                    ) : (
                                        <TrashIcon width={24} height={24} />
                                    )}
                                    <span className="text-[17px] font-bold leading-[22px] text-main">
                                        <Trans>Delete</Trans>
                                    </span>
                                </ClickableButton>
                            )}
                        </Menu.Item>
                    ) : (
                        <Menu.Item>
                            {({ close }) => (
                                <ClickableButton
                                    className="flex cursor-pointer items-center space-x-2 p-4 hover:bg-bg"
                                    onClick={async () => {
                                        close();
                                        await handleToggle();
                                        queryClient.invalidateQueries({
                                            queryKey: [source, 'post-detail', id],
                                        });
                                    }}
                                >
                                    {isFollowed ? (
                                        <UnFollowUserIcon width={24} height={24} />
                                    ) : (
                                        <FollowUserIcon width={24} height={24} />
                                    )}
                                    <span className="text-[17px] font-bold leading-[22px] text-main">
                                        <Select
                                            value={isFollowed ? 'unfollow' : 'follow'}
                                            _follow="Follow"
                                            _unfollow="Unfollow"
                                            other="Follow"
                                        />{' '}
                                        @{author.handle}
                                    </span>
                                </ClickableButton>
                            )}
                        </Menu.Item>
                    )}
                </Menu.Items>
            </Transition>
        </Menu>
    );
});
