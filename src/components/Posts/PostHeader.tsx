import { memo, useMemo } from 'react';

import { MoreAction } from '@/components/Actions/More.js';
import { Avatar } from '@/components/Avatar.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { SocialPlatform } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

interface PostHeaderProps {
    post: Post;
    isQuote?: boolean;
}

export const PostHeader = memo<PostHeaderProps>(function PostHeader({ post, isQuote = false }) {
    const currentSource = useGlobalState.use.currentSource();
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();

    const isMyPost = useMemo(
        () =>
            currentSource === SocialPlatform.Lens
                ? post.author.profileId === currentLensProfile?.profileId
                : post.author.profileId === currentFarcasterProfile?.profileId,
        [currentFarcasterProfile?.profileId, currentLensProfile?.profileId, currentSource, post.author.profileId],
    );

    const profileLink = getProfileUrl(post.author);

    return (
        <div className="flex justify-between space-x-1.5">
            <div className="flex items-start space-x-3">
                <Link href={profileLink} className="z-[1]">
                    <Avatar
                        className={classNames('rounded-full bg-secondary', {
                            'h-10 w-10': !isQuote,
                            'h-6 w-6': isQuote,
                        })}
                        src={post.author.pfp}
                        size={40}
                        alt={post.author.profileId}
                    />
                </Link>

                <div className="flex max-w-sm items-center">
                    <div className="flex items-center space-x-2">
                        <Link href={profileLink} className="block text-[15px] font-bold leading-5">
                            {post.author.displayName || post.author.handle}
                        </Link>
                        <Link href={profileLink} className="text-[15px] leading-6 text-secondary">
                            @{post.author.handle}
                        </Link>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2 self-baseline">
                <SourceIcon source={post.source} />
                <span className="text-[13px] leading-4 text-secondary">
                    <TimestampFormatter time={post.timestamp} />
                </span>
                {!isQuote && !isMyPost ? <MoreAction post={post} /> : null}
            </div>
        </div>
    );
});
