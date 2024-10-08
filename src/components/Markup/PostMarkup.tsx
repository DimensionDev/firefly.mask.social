import { Markup } from '@/components/Markup/Markup.js';
import { classNames } from '@/helpers/classNames.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface PostMarkupProps {
    post: Post;
    content: string;
    canShowMore: boolean;
}

export function PostMarkup({ post, content, canShowMore }: PostMarkupProps) {
    return (
        <Markup
            post={post}
            className={classNames(
                { 'line-clamp-5': canShowMore, 'single-post': canShowMore },
                'markup linkify break-words text-medium',
            )}
        >
            {content}
        </Markup>
    );
}
