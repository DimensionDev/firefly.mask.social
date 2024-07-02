import { first } from 'lodash-es';

import { SOLANA_BLINK_REGEX } from '@/constants/regexp.js';
import { parseBlinksFromContent } from '@/helpers/parseBlinksFromContent.js';
import { removeUrlAtEnd } from '@/helpers/removeUrlAtEnd.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function resolvePostContent(post: Post, endingLinkCollapsed?: boolean) {
    let content = post.metadata.content?.content ?? '';
    const solanaBlinkMatchOembedUrl = post.metadata?.content?.oembedUrl?.match(SOLANA_BLINK_REGEX);
    const parsedBlinks = parseBlinksFromContent(content);
    const solanaBlinkMatchContent = first(parsedBlinks.decodedUrls);
    content = parsedBlinks.content;
    if (endingLinkCollapsed && post.metadata.content?.oembedUrl)
        content = removeUrlAtEnd(post.metadata.content?.oembedUrl, content);

    return {
        content,
        blink: solanaBlinkMatchOembedUrl ? solanaBlinkMatchOembedUrl[2] : solanaBlinkMatchContent,
    };
}
