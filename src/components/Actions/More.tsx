import { Menu, Transition } from '@headlessui/react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { motion } from 'framer-motion';
import { first } from 'lodash-es';
import { Fragment, memo } from 'react';

import FollowUserIcon from '@/assets/follow-user.svg';
import LoadingIcon from '@/assets/loading.svg';
import MoreIcon from '@/assets/more.svg';
import TrashIcon from '@/assets/trash.svg';
import UnFollowUserIcon from '@/assets/unfollow-user.svg';
import { BlockUserButton } from '@/components/Actions/BlockUserButton.js';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { MuteChannelButton } from '@/components/Actions/MuteChannelButton.js';
import { ReportUserButton } from '@/components/Actions/ReportUserButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { config } from '@/configs/wagmiClient.js';
import { EngagementType, type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_ENGAGEMENT_TAB_TYPE } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { resolveSocialSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useDeletePost } from '@/hooks/useDeletePost.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useReportUser } from '@/hooks/useReportUser.js';
import { useToggleBlock } from '@/hooks/useToggleBlock.js';
import { useToggleBlockChannel } from '@/hooks/useToggleBlockChannel.js';
import { useToggleFollow } from '@/hooks/useToggleFollow.js';
import { LoginModalRef } from '@/modals/controls.js';
import type { Channel, Profile } from '@/providers/types/SocialMedia.js';

interface MoreProps {
    source: SocialSource;
    author: Profile;
    channel?: Channel;
    id?: string;
}

export const MoreAction = memo<MoreProps>(function MoreAction({ source, author, id, channel }) {
    const isLogin = useIsLogin(source);
    const currentProfile = useCurrentProfile(source);

    const isMyPost = isSameProfile(author, currentProfile);

    const isFollowing = !!author.viewerContext?.following;
    const [togglingFollow, toggleFollow] = useToggleFollow(author);
    const [{ loading: deleting }, deletePost] = useDeletePost(source);
    const [{ loading: reporting }, reportUser] = useReportUser(currentProfile);
    const [{ loading: blocking }, toggleBlock] = useToggleBlock(currentProfile);
    const [{ loading: channelBlocking }, toggleBlockChannel] = useToggleBlockChannel();
    const engagementType = first(SORTED_ENGAGEMENT_TAB_TYPE[source]) || EngagementType.Likes;

    const isBusy = togglingFollow || reporting || blocking || channelBlocking;
    return (
        <Menu
            className=" relative"
            as="div"
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <Menu.Button
                whileTap={{ scale: 0.9 }}
                as={motion.button}
                className="flex items-center text-secondary"
                aria-label="More"
                onClick={async (event) => {
                    event.stopPropagation();
                    if (!isLogin) {
                        event.preventDefault();
                        if (source === Source.Lens) await getWalletClientRequired(config);
                        LoginModalRef.open({ source });
                    }
                }}
            >
                {isBusy ? (
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
                    className="absolute right-0 z-[1000] flex w-max flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-primaryBottom py-3 text-base text-main"
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                >
                    {isMyPost ? (
                        <Menu.Item>
                            {({ close }) => (
                                <MenuButton
                                    onClick={async () => {
                                        close();
                                        if (id) deletePost(id);
                                    }}
                                >
                                    {deleting ? (
                                        <LoadingIcon width={24} height={24} className="animate-spin text-danger" />
                                    ) : (
                                        <TrashIcon width={24} height={24} />
                                    )}
                                    <span className="font-bold leading-[22px] text-main">
                                        <Trans>Delete</Trans>
                                    </span>
                                </MenuButton>
                            )}
                        </Menu.Item>
                    ) : (
                        <>
                            <Menu.Item>
                                {({ close }) => (
                                    <MenuButton
                                        onClick={async () => {
                                            close();
                                            toggleFollow.mutate();
                                        }}
                                    >
                                        {togglingFollow ? (
                                            <LoadingIcon width={24} height={24} className="animate-spin text-danger" />
                                        ) : isFollowing ? (
                                            <UnFollowUserIcon width={24} height={24} />
                                        ) : (
                                            <FollowUserIcon width={24} height={24} />
                                        )}
                                        <span className="font-bold leading-[22px] text-main">
                                            {isFollowing ? t`Unfollow @${author.handle}` : t`Follow @${author.handle}`}
                                        </span>
                                    </MenuButton>
                                )}
                            </Menu.Item>
                            {source === Source.Lens ? (
                                <Menu.Item>
                                    {({ close }) => (
                                        <ReportUserButton
                                            busy={reporting}
                                            profile={author}
                                            onReport={reportUser}
                                            onClick={close}
                                        />
                                    )}
                                </Menu.Item>
                            ) : null}
                            {channel && currentProfile ? (
                                <Menu.Item>
                                    {({ close }) => (
                                        <MuteChannelButton
                                            busy={channelBlocking}
                                            channel={channel}
                                            onToggleBlock={toggleBlockChannel}
                                            onClick={close}
                                        />
                                    )}
                                </Menu.Item>
                            ) : null}
                            <Menu.Item>
                                {({ close }) => (
                                    <BlockUserButton
                                        busy={blocking}
                                        profile={author}
                                        onToggleBlock={toggleBlock}
                                        onClick={close}
                                    />
                                )}
                            </Menu.Item>
                        </>
                    )}
                    {id ? (
                        <Menu.Item
                            as={Link}
                            shallow
                            href={`/post/${id}/${engagementType}?source=${resolveSocialSourceInURL(source)}`}
                            className="box-border flex h-8 cursor-pointer items-center space-x-2 px-3 py-1 hover:bg-bg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ChartBarIcon width={24} height={24} />
                            <span className="font-bold leading-[22px] text-main">
                                <Trans>View Engagements</Trans>
                            </span>
                        </Menu.Item>
                    ) : null}
                </Menu.Items>
            </Transition>
        </Menu>
    );
});
