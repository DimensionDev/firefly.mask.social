import { memo } from 'react';
import { useDarkMode } from 'usehooks-ts';

import More from '@/assets/more.svg';
import { Image } from '@/components/Image.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { classNames } from '@/helpers/classNames.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface PostHeaderProps {
    post: Post;
    isQuote?: boolean;
}

export const PostHeader = memo<PostHeaderProps>(function PostHeader({ post, isQuote = false }) {
    const { isDarkMode } = useDarkMode();

    return (
        <div className="flex justify-between space-x-1.5">
            <div className="flex items-center space-x-3">
                <Image
                    loading="lazy"
                    className={classNames('z-[1] rounded-full border bg-secondary', {
                        'h-10': !isQuote,
                        'w-10': !isQuote,
                        'h-6': isQuote,
                        'w-6': isQuote,
                    })}
                    src={post.author.pfp}
                    fallback={!isDarkMode ? '/image/firefly-light-avatar.png' : '/image/firefly-dark-avatar.png'}
                    width={40}
                    height={40}
                    alt={post.author.profileId}
                />

                <div className="flex max-w-sm items-center">
                    <div className="flex items-center space-x-2">
                        <span className="block text-sm font-bold leading-5">{post.author.displayName}</span>
                        <span className="text-sm leading-6 text-secondary">@{post.author.displayName}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <SourceIcon source={post.source} />
                <span className="text-xs leading-4 text-secondary">
                    <TimestampFormatter time={post.timestamp} />
                </span>
                {!isQuote ? (
                    <span className="text-secondary">
                        <More width={24} height={24} />
                    </span>
                ) : null}
            </div>
        </div>
    );
});
