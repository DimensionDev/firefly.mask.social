import { usePathname } from 'next/navigation.js';
import { memo } from 'react';

import FireflyAvatarIcon from '@/assets/firefly-avatar.svg';
import PowerUserIcon from '@/assets/power-user.svg';
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
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { isSendFromFirefly } from '@/helpers/isSendFromFirefly.js';
import { useFireflyIdentity } from '@/hooks/useFireflyIdentity.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface PostHeaderProps {
    post: Post;
    isQuote?: boolean;
    isComment?: boolean;
    showDate?: boolean;
    onClickProfileLink?: () => void;
}

export const PostHeader = memo<PostHeaderProps>(function PostHeader({
    post,
    isQuote = false,
    isComment = false,
    showDate = false,
    onClickProfileLink,
}) {
    const profileLink = getProfileUrl(post.author);

    const isSmall = useIsSmall('max');
    const pathname = usePathname();
    const isDetailPage = isRoutePathname(pathname, '/post/:detail', true);

    const identity = useFireflyIdentity(post.source, post.author.profileId);
    const newLine = !isQuote && (isSmall || (isDetailPage && !isComment && !showDate));

    const handle = (
        <ProfileTippy identity={identity}>
            <Link
                href={profileLink}
                className="max-w-[150px] flex-shrink-0 truncate text-medium leading-5 text-secondary"
                onClick={(event) => event.stopPropagation()}
            >
                @{post.author.handle}
            </Link>
        </ProfileTippy>
    );

    return (
        <div className={classNames('flex gap-3', isQuote ? 'items-center' : 'items-start')}>
            <ProfileTippy identity={identity}>
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
                className={classNames({
                    'w-[calc(100%-40px-20px-24px)]': !isQuote,
                    'w-[calc(100%-24px-24px)]': isQuote,
                })}
            >
                <div className="flex max-w-full flex-1 items-center overflow-hidden">
                    <ProfileTippy identity={identity}>
                        <Link
                            href={profileLink}
                            className="mr-1 block truncate text-medium font-bold leading-5 text-main"
                            onClick={(event) => event.stopPropagation()}
                        >
                            {post.author.displayName}
                        </Link>
                    </ProfileTippy>
                    {post.author.isPowerUser ? (
                        <PowerUserIcon className="mr-2 shrink-0" width={16} height={16} />
                    ) : null}
                    {newLine ? null : handle}
                    {post.timestamp && (isComment || isQuote || !isDetailPage || showDate) ? (
                        <>
                            <span className="mx-1 leading-5 text-secondary">·</span>
                            <span className="whitespace-nowrap text-medium leading-5 text-secondary">
                                <TimestampFormatter time={post.timestamp} />
                            </span>
                            <span className="mx-1 leading-5 text-secondary">·</span>
                        </>
                    ) : null}
                    {isSendFromFirefly(post) ? (
                        <FireflyAvatarIcon fontSize={15} width={15} height={15} className="mr-1 inline shrink-0" />
                    ) : null}
                    <SocialSourceIcon className="shrink-0" source={post.source} size={15} />
                </div>
                {newLine ? <div>{handle}</div> : null}
            </div>
            <div className="ml-auto flex items-center space-x-2 self-baseline">
                {!post.isHidden && !isQuote ? (
                    <MoreAction channel={post.channel} source={post.source} author={post.author} post={post} />
                ) : null}
            </div>
        </div>
    );
});
