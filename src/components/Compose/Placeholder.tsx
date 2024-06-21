import { t } from '@lingui/macro';

import { readChars } from '@/helpers/chars.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';

interface PlaceholderProps {
    post: CompositePost;
}

export function Placeholder(props: PlaceholderProps) {
    const { posts } = useComposeStateStore();

    const index = posts.findIndex((x) => x.id === props.post.id);
    const content = readChars(props.post.chars, 'visible');

    return (
        <div className="cursor-text resize-none appearance-none whitespace-pre-wrap border-none bg-transparent p-0 text-left text-[15px] leading-5 text-main outline-0 focus:ring-0">
            {content ? (
                content
            ) : (
                <span className="text-secondary">
                    {props.post.poll
                        ? t`Ask a question`
                        : index === 0
                          ? t`What's happening...`
                          : t`Add another post...`}
                </span>
            )}
        </div>
    );
}
