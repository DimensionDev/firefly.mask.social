import { Menu } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import { first } from 'lodash-es';
import { memo } from 'react';

import EngagementIcon from '@/assets/engagement.svg';
import FollowUserIcon from '@/assets/follow-user.svg';
import LoadingIcon from '@/assets/loading.svg';
import MoreIcon from '@/assets/more.svg';
import TrashIcon from '@/assets/trash.svg';
import UnFollowUserIcon from '@/assets/unfollow-user.svg';
import { BookmarkButton } from '@/components/Actions/BookmarkButton.js';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { MuteChannelButton } from '@/components/Actions/MuteChannelButton.js';
import { MuteProfileButton } from '@/components/Actions/MuteProfileButton.js';
import { ReportPostButton } from '@/components/Actions/ReportPostButton.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { Tooltip } from '@/components/Tooltip.js';
import { queryClient } from '@/configs/queryClient.js';
import { EngagementType, type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_ENGAGEMENT_TAB_TYPE } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { resolveProfileId } from '@/helpers/resolveProfileId.js';
import { resolveSocialSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useDeletePost } from '@/hooks/useDeletePost.js';
import { useIsMyRelatedProfile } from '@/hooks/useIsMyRelatedProfile.js';
import { useReportPost } from '@/hooks/useReportPost.js';
import { useToggleFollow } from '@/hooks/useToggleFollow.js';
import { useToggleMutedChannel } from '@/hooks/useToggleMutedChannel.js';
import { useToggleMutedProfile } from '@/hooks/useToggleMutedProfile.js';
import type { Channel, Post, Profile } from '@/providers/types/SocialMedia.js';

interface MoreProps {
    source: SocialSource;
    author: Profile;
    channel?: Channel;
    post?: Post;
}

export const MoreAction = memo<MoreProps>(function MoreAction({ source, author, post, channel }) {
    const currentProfile = useCurrentProfile(source);

    const isMyPost = isSameProfile(author, currentProfile);
    const isMyProfile = useIsMyRelatedProfile(resolveProfileId(author) ?? '', source);

    const isFollowing = !!author.viewerContext?.following;
    const [, toggleFollow] = useToggleFollow(author);
    const [{ loading: deleting }, deletePost] = useDeletePost(source);
    const [, reportPost] = useReportPost();
    const [, toggleMutedProfile] = useToggleMutedProfile(currentProfile);
    const [, toggleMutedChannel] = useToggleMutedChannel();
    const engagementType = first(SORTED_ENGAGEMENT_TAB_TYPE[source]) || EngagementType.Likes;

    return (
        <MoreActionMenu
            source={source}
            button={
                <Tooltip content={t`More`} placement="top">
                    <MoreIcon width={24} height={24} />
                </Tooltip>
            }
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
                                    if (post?.postId) deletePost(post);
                                }}
                            >
                                {deleting ? (
                                    <LoadingIcon width={18} height={18} className="animate-spin text-danger" />
                                ) : (
                                    <TrashIcon width={18} height={18} className="text-danger" />
                                )}
                                <span className="font-bold leading-[22px] text-danger">
                                    <Trans>Delete post</Trans>
                                </span>
                            </MenuButton>
                        )}
                    </Menu.Item>
                ) : (
                    <>
                        {!isMyProfile ? (
                            <>
                                <Menu.Item>
                                    {({ close }) => (
                                        <MenuButton
                                            onClick={async () => {
                                                close();
                                                toggleFollow.mutate();
                                            }}
                                        >
                                            {isFollowing ? (
                                                <UnFollowUserIcon width={18} height={18} />
                                            ) : (
                                                <FollowUserIcon width={18} height={18} />
                                            )}
                                            <span className="font-bold leading-[22px] text-main">
                                                {isFollowing
                                                    ? t`Unfollow @${author.handle}`
                                                    : t`Follow @${author.handle}`}
                                            </span>
                                        </MenuButton>
                                    )}
                                </Menu.Item>
                                {post && [Source.Lens, Source.Farcaster].includes(source) ? (
                                    <Menu.Item>
                                        {({ close }) => (
                                            <ReportPostButton post={post} onReport={reportPost} onClick={close} />
                                        )}
                                    </Menu.Item>
                                ) : null}
                            </>
                        ) : null}
                        {channel && currentProfile ? (
                            <Menu.Item>
                                {({ close }) => (
                                    <MuteChannelButton
                                        channel={channel}
                                        onToggle={async (channel: Channel) => {
                                            const result = await toggleMutedChannel(channel);
                                            queryClient.refetchQueries({
                                                queryKey: ['posts', channel.source],
                                            });
                                            return result;
                                        }}
                                        onClick={close}
                                    />
                                )}
                            </Menu.Item>
                        ) : null}
                        {!isMyProfile ? (
                            <Menu.Item>
                                {({ close }) => (
                                    <MuteProfileButton profile={author} onToggle={toggleMutedProfile} onClick={close} />
                                )}
                            </Menu.Item>
                        ) : null}
                    </>
                )}
                {post && post.source !== Source.Twitter ? (
                    <Menu.Item>{({ close }) => <BookmarkButton post={post} onClick={close} />}</Menu.Item>
                ) : null}
                {post?.postId && post.source !== Source.Twitter ? (
                    <Menu.Item
                        as={Link}
                        shallow
                        href={`/post/${post.postId}/${engagementType}?source=${resolveSocialSourceInURL(source)}`}
                        className="box-border flex h-8 cursor-pointer items-center space-x-2 px-3 py-1 hover:bg-bg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <EngagementIcon width={18} height={18} />
                        <span className="font-bold leading-[22px] text-main">
                            <Trans>View engagements</Trans>
                        </span>
                    </Menu.Item>
                ) : null}
            </Menu.Items>
        </MoreActionMenu>
    );
});
