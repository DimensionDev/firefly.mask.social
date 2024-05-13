'use client';

import { compact } from 'lodash-es';
import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
// @ts-expect-error
import linkifyRegex from 'remark-linkify-regex';
import stripMarkdown from 'strip-markdown';

import { Code } from '@/components/Code.js';
import type { MarkupProps } from '@/components/Markup/Markup.js';
import { MarkupLink } from '@/components/Markup/MarkupLink/index.js';
import { Source } from '@/constants/enum.js';
import { CHANNEL_REGEX, HASHTAG_REGEX, URL_REGEX } from '@/constants/regexp.js';

const trimify = (value: string): string => value.replace(/\n\n\s*\n/g, '\n\n').trim();

export const Markup = memo<MarkupProps>(function Markup({ children, post, ...rest }) {
    const plugins = useMemo(() => {
        if (!post?.mentions?.length)
            return compact([
                [stripMarkdown, { keep: ['strong', 'emphasis', 'inlineCode'] }],
                remarkBreaks,

                linkifyRegex(URL_REGEX),
                post?.source === Source.Farcaster ? linkifyRegex(CHANNEL_REGEX) : undefined,
                linkifyRegex(HASHTAG_REGEX),
            ]);
        const handles = post.mentions.map((x) => x.fullHandle);
        const mentionRe = new RegExp(`@(${handles.join('|')})`, 'g');
        return compact([
            [stripMarkdown, { keep: ['strong', 'emphasis', 'inlineCode'] }],
            remarkBreaks,

            // Make sure Mention plugin is before URL plugin, to avoid matching
            // mentioned ens handle as url. For example, @mask.eth should be treat
            // as a mention rather than link
            linkifyRegex(mentionRe),
            linkifyRegex(URL_REGEX),
            post?.source === Source.Farcaster ? linkifyRegex(CHANNEL_REGEX) : undefined,
            linkifyRegex(HASHTAG_REGEX),
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
                a: (props) => <MarkupLink title={props.title} post={post} source={post?.source} />,
                code: Code,
                ...rest.components,
            }}
        >
            {trimify(children)}
        </ReactMarkdown>
    );
});

// Render without tags, but leave <br/> and <p/> to keep paragraphs
const allowedElements = ['br', 'p', 'a'];
export function NakedMarkup(props: MarkupProps) {
    return <Markup {...props} allowedElements={allowedElements} unwrapDisallowed />;
}
