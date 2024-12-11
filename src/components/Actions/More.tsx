import { MenuItem } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import { first } from 'lodash-es';
import { memo, useCallback, useMemo } from 'react';

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
import { MenuGroup } from '@/components/MenuGroup.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { BaseToggleFollowButton } from '@/components/Profile/BaseToggleFollowButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { queryClient } from '@/configs/queryClient.js';
import { EngagementType, type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_ENGAGEMENT_TAB_TYPE } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { resolveFireflyProfileId } from '@/helpers/resolveFireflyProfileId.js';
import { resolveSocialSourceInUrl } from '@/helpers/resolveSourceInUrl.js';
import { stopPropagation } from '@/helpers/stopEvent.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useDeletePost } from '@/hooks/useDeletePost.js';
import { useIsMyRelatedProfile } from '@/hooks/useIsMyRelatedProfile.js';
import { useReportPost } from '@/hooks/useReportPost.js';
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
    const isMyProfile = useIsMyRelatedProfile(source, resolveFireflyProfileId(author) ?? '');
    const isFollowing = !!author.viewerContext?.following;

    const [{ loading: deleting }, deletePost] = useDeletePost(source);
    const [, reportPost] = useReportPost();
    const [, toggleMutedProfile] = useToggleMutedProfile(currentProfile);
    const [, toggleMutedChannel] = useToggleMutedChannel();

    const followButtonLabelRender = useCallback(
        (showSuperFollow: boolean, loading: boolean) => {
            const icon = loading ? (
                <LoadingIcon width={18} height={18} className="animate-spin" />
            ) : isFollowing ? (
                <UnFollowUserIcon width={18} height={18} />
            ) : (
                <FollowUserIcon width={18} height={18} />
            );
            const label = showSuperFollow
                ? t`Super Follow`
                : isFollowing
                  ? t`Unfollow @${author.handle}`
                  : t`Follow @${author.handle}`;
            return (
                <>
                    {icon}
                    <span className="font-bold leading-[22px] text-main">{label}</span>
                </>
            );
        },
        [isFollowing, author.handle],
    );

    const engagementType = first(SORTED_ENGAGEMENT_TAB_TYPE[source]) || EngagementType.Likes;

    // all menu items are hidden
    if (
        !isMyPost &&
        isMyProfile &&
        !(channel && currentProfile) &&
        !(post && post.source !== Source.Twitter) &&
        !(post?.postId && post.source !== Source.Twitter)
    )
        return null;

    return useMemo(
        () => (
            <MoreActionMenu
                className="z-10"
                source={source}
                button={
                    <Tooltip content={t`More`} placement="top">
                        <MoreIcon width={20} height={20} className="text-secondary" />
                    </Tooltip>
                }
            >
                <MenuGroup>
                    {isMyPost ? (
                        <MenuItem>
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
                        </MenuItem>
                    ) : (
                        <>
                            {!isMyProfile ? (
                                <>
                                    <MenuItem>
                                        {({ close }) => (
                                            <BaseToggleFollowButton
                                                className="flex h-8 cursor-pointer items-center space-x-2 px-3 py-1 hover:bg-bg"
                                                onClick={close}
                                                profile={author}
                                            >
                                                {followButtonLabelRender}
                                            </BaseToggleFollowButton>
                                        )}
                                    </MenuItem>
                                    {post && [Source.Lens, Source.Farcaster].includes(source) ? (
                                        <MenuItem>
                                            {({ close }) => (
                                                <ReportPostButton post={post} onReport={reportPost} onClick={close} />
                                            )}
                                        </MenuItem>
                                    ) : null}
                                </>
                            ) : null}
                            {channel && currentProfile && source === Source.Farcaster ? (
                                <MenuItem>
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
                                </MenuItem>
                            ) : null}
                            {!isMyProfile ? (
                                <>
                                    <MenuItem>
                                        {({ close }) => (
                                            <MuteProfileButton
                                                profile={author}
                                                onToggle={toggleMutedProfile}
                                                onClick={close}
                                            />
                                        )}
                                    </MenuItem>
                                </>
                            ) : null}
                        </>
                    )}
                    {post && post.source !== Source.Twitter ? (
                        <MenuItem>{({ close }) => <BookmarkButton post={post} onClick={close} />}</MenuItem>
                    ) : null}
                    {post?.postId && post.source !== Source.Twitter ? (
                        <MenuItem>
                            <Link
                                shallow
                                href={`/post/${resolveSocialSourceInUrl(source)}/${post.postId}/${engagementType}`}
                                className="box-border flex h-8 cursor-pointer items-center space-x-2 px-3 py-1 hover:bg-bg"
                                onClick={stopPropagation}
                            >
                                <EngagementIcon width={18} height={18} />
                                <span className="font-bold leading-[22px] text-main">
                                    <Trans>View engagements</Trans>
                                </span>
                            </Link>
                        </MenuItem>
                    ) : null}
                </MenuGroup>
            </MoreActionMenu>
        ),
        [
            source,
            isMyPost,
            isMyProfile,
            deleting,
            deletePost,
            author.handle,
            followButtonLabelRender,
            reportPost,
            channel,
            currentProfile,
            toggleMutedChannel,
            toggleMutedProfile,
            post,
            engagementType,
            stopPropagation,
        ],
    );
});
