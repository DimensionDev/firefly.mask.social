import type { Post } from '@/providers/types/SocialMedia.js';
import { memo } from 'react';
import { Image } from '@/components/Image.js';
import More from '../../assets/more.svg';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';

interface PostHeaderProps {
    post: Post;
}
export const PostHeader = memo<PostHeaderProps>(function PostHeader({ post }) {
    return (
        <div className="flex justify-between space-x-1.5">
            <div className="flex items-center space-x-3">
                <Image
                    loading="lazy"
                    className="h-10 w-10 rounded-full border"
                    src={post.author.pfp}
                    width={40}
                    height={40}
                    alt={post.author.profileId}
                />

                <div className="flex max-w-sm items-center">
                    <div className="flex space-x-2">
                        <div className="text-sm font-bold leading-5">{post.author.displayName}</div>
                        <span className="text-sm leading-6 text-secondary">@{post.author.displayName}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Image src="/svg/lens.svg" width={16} height={16} alt="lens" />
                <span className="text-xs leading-4 text-secondary">
                    <TimestampFormatter time={post.timestamp} />
                </span>
                <span className="text-secondary">
                    <More width={24} height={24} />
                </span>
            </div>
        </div>
    );
});
