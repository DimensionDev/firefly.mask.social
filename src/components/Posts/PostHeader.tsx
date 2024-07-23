import { memo } from 'react';

import { MoreAction } from '@/components/Actions/More.js';
import { Avatar } from '@/components/Avatar.js';
import { ProfileTippy } from '@/components/Profile/ProfileTippy.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { Source } from '@/constants/enum.js';
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
    onClickProfileLink?: () => void;
}

export const PostHeader = memo<PostHeaderProps>(function PostHeader({ post, isQuote = false, onClickProfileLink }) {
    const currentProfile = useCurrentProfile(post.source);

    const isMyPost = isSameProfile(post.author, currentProfile);
    const profileLink = getProfileUrl(post.author);

    return (
        <div className="flex items-start gap-3">
            <ProfileTippy source={post.author.source} identity={post.author.profileId}>
                <Link
                    href={profileLink}
                    className="z-[1]"
                    onClick={(event) => {
                        onClickProfileLink?.();
                        event.stopPropagation();
                    }}
                >
                    <Avatar
                        className={classNames({
                            'h-10 w-10': !isQuote,
                            'h-6 w-6': isQuote,
                        })}
                        src={post.author.pfp}
                        size={isQuote ? 24 : 40}
                        alt={post.author.profileId}
                        fallbackUrl={post.source === Source.Lens ? getLennyURL(post.author.handle) : undefined}
                    />
                </Link>
            </ProfileTippy>

            <div
                className={classNames('flex flex-1 items-center gap-2 overflow-hidden', {
                    'max-w-[calc(100%-40px-88px-24px)]': !isQuote && !isMyPost,
                    'max-w-[calc(100%-40px-88px)]': !isQuote && isMyPost,
                })}
            >
                <ProfileTippy source={post.author.source} identity={post.author.profileId}>
                    <Link
                        href={profileLink}
                        className="block truncate text-clip text-[15px] font-bold leading-5 text-main"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {post.author.displayName}
                    </Link>
                </ProfileTippy>
                <ProfileTippy source={post.author.source} identity={post.author.profileId}>
                    <Link
                        href={profileLink}
                        className="truncate text-clip text-[15px] leading-6 text-secondary"
                        onClick={(event) => event.stopPropagation()}
                    >
                        @{post.author.handle}
                    </Link>
                </ProfileTippy>
            </div>
            <div className="ml-auto flex items-center space-x-2 self-baseline">
                <SocialSourceIcon source={post.source} />
                <span className="whitespace-nowrap text-xs leading-4 text-secondary md:text-[13px]">
                    <TimestampFormatter time={post.timestamp} />
                </span>
                {!isQuote ? (
                    <MoreAction channel={post.channel} source={post.source} author={post.author} post={post} />
                ) : null}
            </div>
        </div>
    );
});
