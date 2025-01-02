import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { uniqBy } from 'lodash-es';
import { memo, useMemo, useState } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { Editor } from '@/components/Compose/Editor.js';
import { ExcludeReplyUserListModal } from '@/components/Posts/ExcludeReplyUserList.js';
import { PostBody } from '@/components/Posts/PostBody.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { Source } from '@/constants/enum.js';
import { getLennyUrl } from '@/helpers/getLennyUrl.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useCurrentAvailableProfile } from '@/hooks/useCurrentAvailableProfile.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';

interface ReplyProps {
    post: Post;
    compositePost: CompositePost;
}

export const Reply = memo<ReplyProps>(function Reply({ post, compositePost }) {
    const currentProfile = useCurrentAvailableProfile(post.source);
    const [open, setOpen] = useState(false);
    const { excludeReplyProfileIds = [] } = useCompositePost();
    const updateExcludeReplyProfileIds = useComposeStateStore().updateExcludeReplyProfileIds;
    const avatarFallbackUrl = post.source === Source.Lens ? getLennyUrl(post.author.handle) : undefined;

    const { data, isLoading } = useQuery({
        queryKey: ['post-thread', post.source, post.postId],
        queryFn() {
            const provider = resolveSocialMediaProvider(post.source);
            return provider.getThreadByPostId(post.postId);
        },
    });

    const profiles = useMemo(() => uniqBy(data?.map((x) => x.author) ?? [], (x) => x.profileId), [data]);
    const replyingProfilesContent = useMemo(() => {
        const filteredProfiles = profiles.filter((profile) => !excludeReplyProfileIds.includes(profile.profileId));
        if (filteredProfiles.length === 2) {
            return (
                <Trans>
                    Replying to <span className="text-link">@{filteredProfiles[0].handle}</span> and{' '}
                    <span className="text-link">@{filteredProfiles[1].handle}</span> on {resolveSourceName(post.source)}
                </Trans>
            );
        }
        if (filteredProfiles.length === 3) {
            return (
                <Trans>
                    Replying to <span className="text-link">@{filteredProfiles[0].handle}</span>
                    {' ,'}
                    <span className="text-link">@{filteredProfiles[1].handle}</span> and{' '}
                    <span className="text-link">@{filteredProfiles[2].handle}</span> on {resolveSourceName(post.source)}
                </Trans>
            );
        }
        if (filteredProfiles.length >= 4) {
            return (
                <Trans>
                    Replying to <span className="text-link">@{filteredProfiles[0].handle}</span>
                    {' ,'}
                    <span className="text-link">@{filteredProfiles[1].handle}</span> and{' '}
                    <span className="text-link">{filteredProfiles.length - 2} others</span> on{' '}
                    {resolveSourceName(post.source)}
                </Trans>
            );
        }
        return (
            <Trans>
                Replying to <span className="text-link">@{post.author.handle}</span> on {resolveSourceName(post.source)}
            </Trans>
        );
    }, [profiles]);

    return (
        <>
            <div className="flex gap-3">
                <div className="flex flex-col items-center">
                    <ProfileAvatar profile={post.author} enableSourceIcon={false} fallbackUrl={avatarFallbackUrl} />
                    <div className="min-h-[40px] flex-1 border-[0.8px] border-gray-300 bg-gray-300 dark:border-gray-700 dark:bg-gray-700" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="w-full text-left">
                        <PostBody post={post} isReply disablePadding={post.isHidden || post.isEncrypted} />
                        {isLoading ? (
                            <p className="mt-3 flex h-5 items-center text-medium text-placeholder">
                                <Trans>
                                    <LoadingIcon className="mr-1 flex-shrink-0 animate-spin" width={16} height={16} />{' '}
                                    Loading
                                </Trans>
                            </p>
                        ) : (
                            <ExcludeReplyUserListModal
                                post={post}
                                profiles={profiles}
                                onClose={() => setOpen(false)}
                                open={open}
                                excluded={excludeReplyProfileIds}
                                onClickProfile={(x, checked) => {
                                    updateExcludeReplyProfileIds(
                                        !checked
                                            ? [...excludeReplyProfileIds, x.profileId]
                                            : excludeReplyProfileIds.filter((id) => id !== x.profileId),
                                    );
                                }}
                            >
                                <div className="mt-3 h-5 text-medium text-placeholder" onClick={() => setOpen(true)}>
                                    {replyingProfilesContent}
                                </div>
                            </ExcludeReplyUserListModal>
                        )}
                    </div>
                </div>
            </div>
            <div className="relative flex flex-1 gap-3">
                {currentProfile ? (
                    <ProfileAvatar profile={currentProfile} enableSourceIcon={false} fallbackUrl={avatarFallbackUrl} />
                ) : null}
                <div className="flex flex-1 pt-2">
                    <Editor post={compositePost} replying />
                </div>
            </div>
        </>
    );
});
