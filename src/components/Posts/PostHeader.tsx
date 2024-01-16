import { memo, useMemo } from 'react';

import { MoreAction } from '@/components/Actions/More.js';
import { Avatar } from '@/components/Avatar.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { SocialPlatform } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

interface PostHeaderProps {
    post: Post;
    isQuote?: boolean;
}

export const PostHeader = memo<PostHeaderProps>(function PostHeader({ post, isQuote = false }) {
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();

    const isMyPost = useMemo(
        () =>
            post.source === SocialPlatform.Lens
                ? isSameProfile(post.author, currentLensProfile)
                : isSameProfile(post.author, currentFarcasterProfile),
        [currentFarcasterProfile, currentLensProfile, post.source, post.author],
    );

    const profileLink = getProfileUrl(post.author);

    return (
        <div className="flex justify-between space-x-1.5">
            <div className="flex items-start space-x-3">
                <Link href={profileLink} className="z-[1]" onClick={(event) => event.stopPropagation()}>
                    <Avatar
                        className={classNames('rounded-full bg-secondary', {
                            'h-10 w-10': !isQuote,
                            'h-6 w-6': isQuote,
                        })}
                        src={post.author.pfp}
                        size={isQuote ? 24 : 40}
                        alt={post.author.profileId}
                    />
                </Link>

                <div className="flex max-w-sm items-center">
                    <div className="flex items-center space-x-2">
                        <Link
                            href={profileLink}
                            className="block text-[15px] font-bold leading-5 text-main"
                            onClick={(event) => event.stopPropagation()}
                        >
                            {post.author.displayName}
                        </Link>
                        <Link
                            href={profileLink}
                            className="text-[15px] leading-6 text-secondary"
                            onClick={(event) => event.stopPropagation()}
                        >
                            @{post.author.handle}
                        </Link>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2 self-baseline">
                <SourceIcon
                    source={post.source}
                    className={post.source === SocialPlatform.Lens ? 'dark:opacity-70' : undefined}
                />
                <span className="text-[13px] leading-4 text-secondary">
                    <TimestampFormatter time={post.timestamp} />
                </span>
                {!isQuote && !isMyPost ? (
                    <MoreAction source={post.source} author={post.author} id={post.postId} />
                ) : null}
            </div>
        </div>
    );
});
