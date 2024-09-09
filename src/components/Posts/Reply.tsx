import { Trans } from '@lingui/macro';
import { memo } from 'react';

import { Editor } from '@/components/Compose/Editor.js';
import { PostBody } from '@/components/Posts/PostBody.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { Source } from '@/constants/enum.js';
import { getLennyURL } from '@/helpers/getLennyURL.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useCurrentAvailableProfile } from '@/hooks/useCurrentAvailableProfile.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { CompositePost } from '@/store/useComposeStore.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface ReplyProps {
    post: Post;
    compositePost: CompositePost;
}

export const Reply = memo<ReplyProps>(function Reply({ post, compositePost }) {
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);
    const currentProfile = useCurrentAvailableProfile(currentSocialSource);

    const avatarFallbackUrl = post.source === Source.Lens ? getLennyURL(post.author.handle) : undefined;

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
                        <div className="pt-3 text-medium text-placeholder">
                            <Trans>
                                Replying to <span className="text-link">@{post.author.handle}</span> on{' '}
                                {resolveSourceName(post.source)}
                            </Trans>
                        </div>
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
