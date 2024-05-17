import { Markup } from '@/components/Markup/Markup.js';
import { IS_APPLE, IS_SAFARI } from '@/constants/bowser.js';
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
                { 'line-clamp-5': canShowMore, 'max-h-[8rem]': canShowMore && IS_SAFARI && IS_APPLE },
                'markup linkify break-words text-[15px]',
            )}
        >
            {content}
        </Markup>
    );
}
