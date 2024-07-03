import { Blink } from '@/components/Blink/index.js';
import { Frame } from '@/components/Frame/index.js';
import { Oembed } from '@/components/Oembed/index.js';
import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { BlinkParser } from '@/providers/blink/Parser.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function PostLinks({
    post,
    setEndingLinkCollapsed,
}: {
    post: Post;
    setEndingLinkCollapsed?: (collapsed: boolean) => void;
}) {
    const schemes = post.metadata.content?.content ? BlinkParser.extractSchemes(post.metadata.content?.content) : [];
    const oembed =
        post.metadata.content?.oembedUrl && !post.quoteOn ? (
            <Oembed url={post.metadata.content.oembedUrl} onData={() => setEndingLinkCollapsed?.(true)} />
        ) : null;

    if (schemes.length && env.external.NEXT_PUBLIC_BLINK === STATUS.Enabled) {
        return (
            <Blink urls={schemes.map((x) => x.url)} onData={() => setEndingLinkCollapsed?.(true)}>
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
