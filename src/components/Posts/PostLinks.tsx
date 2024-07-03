import { last } from 'lodash-es';

import { Blink } from '@/components/Blink/index.js';
import { Frame } from '@/components/Frame/index.js';
import { Oembed } from '@/components/Oembed/index.js';
import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { removeAtEnd } from '@/helpers/removeAtEnd.js';
import { BlinkParser } from '@/providers/blink/Parser.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function PostLinks({ post, setContent }: { post: Post; setContent?: (content: string) => void }) {
    // the blink action also contains the normal url, so the result is also available for the oembed and frame components
    const schemes = post.metadata.content?.content ? BlinkParser.extractSchemes(post.metadata.content?.content) : [];

    const oembed =
        post.metadata.content?.oembedUrl && !post.quoteOn ? (
            <Oembed
                url={post.metadata.content.oembedUrl}
                onData={() => {
                    if (post.metadata.content?.oembedUrl && post.metadata.content?.content) {
                        setContent?.(removeAtEnd(post.metadata.content?.content, post.metadata.content.oembedUrl));
                    }
                }}
            />
        ) : null;

    if (schemes.length && env.external.NEXT_PUBLIC_BLINK === STATUS.Enabled) {
        const scheme = last(schemes);
        if (!scheme?.url) return oembed;

        return (
            <Blink
                schemes={[scheme]}
                onData={() => {
                    if (post.metadata.content?.content) {
                        setContent?.(removeAtEnd(post.metadata.content?.content, scheme.blink));
                    }
                }}
            >
                {oembed}
            </Blink>
        );
    }

    if (post.metadata.content?.oembedUrls?.length && env.external.NEXT_PUBLIC_FRAME === STATUS.Enabled) {
        return (
            <Frame urls={post.metadata.content.oembedUrls} postId={post.postId} source={post.source}>
                {oembed}
            </Frame>
        );
    }

    return oembed;
}
