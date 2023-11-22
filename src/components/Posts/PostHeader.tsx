import { memo } from 'react';

import More from '@/assets/more.svg';
import { Image } from '@/components/Image.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { useQueryMode } from '@/hooks/useQueryMode.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface PostHeaderProps {
    post: Post;
    isQuote?: boolean;
}

function getSocialPlatformIconBySource(source: SocialPlatform, mode: 'light' | 'dark') {
    switch (source) {
        case SocialPlatform.Lens:
            return mode === 'light' ? '/svg/lens-light.svg' : '/svg/lens-dark.svg';
        case SocialPlatform.Farcaster:
            return '/svg/farcaster.svg';
        default:
            return '';
    }
}

export const PostHeader = memo<PostHeaderProps>(function PostHeader({ post, isQuote = false }) {
    const mode = useQueryMode();

    const sourceIcon = getSocialPlatformIconBySource(post.source, mode);

    return (
        <div className="flex justify-between space-x-1.5">
            <div className="flex items-center space-x-3">
                <Image
                    loading="lazy"
                    className={classNames('rounded-full border', {
                        'h-10': !isQuote,
                        'w-10': !isQuote,
                        'h-6': isQuote,
                        'w-6': isQuote,
                    })}
                    src={post.author.pfp}
                    fallback={mode === 'light' ? '/image/firefly-light-avatar.png' : '/image/firefly-dark-avatar.png'}
                    width={40}
                    height={40}
                    alt={post.author.profileId}
                />

                <div className="flex max-w-sm items-center">
                    <div className="flex items-center space-x-2">
                        <div className="text-sm font-bold leading-5">{post.author.displayName}</div>
                        <span className="text-sm leading-6 text-secondary">@{post.author.displayName}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                {sourceIcon ? <Image src={sourceIcon} width={16} height={16} alt={post.source} /> : null}
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
