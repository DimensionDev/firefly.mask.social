import { memo } from 'react';

import { MoreAction } from '@/components/Actions/More.js';
import { Avatar } from '@/components/Avatar.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { SocialPlatform } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { getLennyURL } from '@/helpers/getLennyURL.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface PostHeaderProps {
    post: Post;
    isQuote?: boolean;
}

export const PostHeader = memo<PostHeaderProps>(function PostHeader({ post, isQuote = false }) {
    const currentProfile = useCurrentProfile(post.source);

    const isMyPost = isSameProfile(post.author, currentProfile);
    const profileLink = getProfileUrl(post.author);

    return (
        <div className="flex items-start gap-3">
            <Link href={profileLink} className="z-[1]" onClick={(event) => event.stopPropagation()}>
                <Avatar
                    className={classNames({
                        'h-10 w-10': !isQuote,
                        'h-6 w-6': isQuote,
                    })}
                    src={post.author.pfp}
                    size={isQuote ? 24 : 40}
                    alt={post.author.profileId}
                    fallbackUrl={post.source === SocialPlatform.Lens ? getLennyURL(post.author.handle) : undefined}
                />
            </Link>

            <div
                className={classNames('flex flex-1 items-center gap-2 overflow-hidden', {
                    'max-w-[calc(100%-40px-88px-24px)]': !isQuote && !isMyPost,
                    'max-w-[calc(100%-40px-88px)]': !isQuote && isMyPost,
                })}
            >
                <Link
                    href={profileLink}
                    className="block truncate text-clip text-[15px] font-bold leading-5 text-main"
                    onClick={(event) => event.stopPropagation()}
                >
                    {post.author.displayName}
                </Link>
                <Link
                    href={profileLink}
                    className="truncate text-clip text-[15px] leading-6 text-secondary"
                    onClick={(event) => event.stopPropagation()}
                >
                    @{post.author.handle}
                </Link>
            </div>
            <div className="ml-auto flex items-center space-x-2 self-baseline">
                <SourceIcon
                    source={post.source}
                    className={post.source === SocialPlatform.Lens ? 'dark:opacity-70' : undefined}
                />
                <span className="whitespace-nowrap text-xs leading-4 text-secondary md:text-[13px]">
                    <TimestampFormatter time={post.timestamp} />
                </span>
                {!isQuote ? <MoreAction source={post.source} author={post.author} id={post.postId} /> : null}
            </div>
        </div>
    );
});
