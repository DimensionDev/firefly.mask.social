'use client';

import { compact } from 'lodash-es';
import { memo, useMemo } from 'react';
import ReactMarkdown, { type Options as ReactMarkdownOptions } from 'react-markdown';
import remarkBreaks from 'remark-breaks';
// @ts-expect-error
import linkifyRegex from 'remark-linkify-regex';
import stripMarkdown from 'strip-markdown';

import { Code } from '@/components/Code.js';
import { MarkupLink } from '@/components/Markup/MarkupLink/index.js';
import {
    CHANNEL_REGEX,
    EMAIL_REGEX,
    HASHTAG_REGEX,
    LENS_HANDLE_REGEXP,
    SYMBOL_REGEX,
    URL_REGEX,
} from '@/constants/regexp.js';
import { isChannelSupported } from '@/helpers/isChannelSupported.js';
import { trimify } from '@/helpers/trimify.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export interface MarkupProps extends Omit<ReactMarkdownOptions, 'children'> {
    children?: ReactMarkdownOptions['children'] | null;
    post?: Post;
}

export const Markup = memo<MarkupProps>(function Markup({ children, post, ...rest }) {
    const plugins = useMemo(() => {
        if (!post?.mentions?.length)
            return compact([
                [stripMarkdown, { keep: ['strong', 'emphasis', 'inlineCode', 'list', 'listItem'] }],
                remarkBreaks,
                linkifyRegex(EMAIL_REGEX),
                linkifyRegex(URL_REGEX),
                // parsing handle after url
                // for example https://images.lens.phaver.com/insecure/raw:t/plain/3daf21dbbf8ce530685bbfabf5de325d
                linkifyRegex(LENS_HANDLE_REGEXP),
                isChannelSupported(post?.source) ? linkifyRegex(CHANNEL_REGEX) : undefined,
                linkifyRegex(HASHTAG_REGEX),
                linkifyRegex(SYMBOL_REGEX),
            ]);
        const handles = post.mentions.map((x) => x.fullHandle);
        const mentionRe = new RegExp(`@(${handles.join('|')})`, 'g');
        return compact([
            [stripMarkdown, { keep: ['strong', 'emphasis', 'inlineCode', 'list', 'listItem'] }],
            remarkBreaks,
            linkifyRegex(EMAIL_REGEX),
            // Make sure Mention plugin is before URL plugin, to avoid matching
            // mentioned ens handle as url. For example, @mask.eth should be treat
            // as a mention rather than link
            linkifyRegex(mentionRe),
            linkifyRegex(URL_REGEX),
            linkifyRegex(LENS_HANDLE_REGEXP),
            isChannelSupported(post.source) ? linkifyRegex(CHANNEL_REGEX) : undefined,
            linkifyRegex(HASHTAG_REGEX),
            linkifyRegex(SYMBOL_REGEX),
        ]);
    }, [post?.mentions, post?.source]);

    if (!children) return null;

    return (
        <ReactMarkdown
            {...rest}
            remarkPlugins={plugins}
            components={{
                // @ts-ignore
                // eslint-disable-next-line react/no-unstable-nested-components
                a: (props) => <MarkupLink title={props.title} post={post} source={post.source} />,
                code: Code,
                // @ts-ignore
                // eslint-disable-next-line react/no-unstable-nested-components
                ol: (props) => (
                    <ol {...props} style={{ counterReset: `list-counter ${props.start ? props.start - 1 : ''}` }} />
                ),
                ...rest.components,
            }}
        >
            {trimify(children)}
        </ReactMarkdown>
    );
});
