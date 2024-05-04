'use client';
import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { type Options as ReactMarkdownOptions } from 'react-markdown';
import remarkBreaks from 'remark-breaks';
// @ts-expect-error
import linkifyRegex from 'remark-linkify-regex';
import stripMarkdown from 'strip-markdown';

import { Code } from '@/components/Code.js';
import { MarkupLink } from '@/components/Markup/MarkupLink/index.js';
import { BIO_TWITTER_PROFILE_REGEX, HASHTAG_REGEX, MENTION_REGEX, URL_REGEX } from '@/constants/regex.js';
import type { Post } from '@/providers/types/SocialMedia.js';

const trimify = (value: string): string => value.replace(/\n\n\s*\n/g, '\n\n').trim();

interface MarkupProps extends Omit<ReactMarkdownOptions, 'children'> {
    children?: ReactMarkdownOptions['children'] | null;
    post?: Post;
}

export const Markup = memo<MarkupProps>(function Markup({ children, post, ...rest }) {
    const plugins = useMemo(() => {
        if (!post?.mentions?.length)
            return [
                [stripMarkdown, { keep: ['strong', 'emphasis', 'inlineCode'] }],
                remarkBreaks,
                linkifyRegex(URL_REGEX),
                linkifyRegex(HASHTAG_REGEX),
            ];
        const handles = post.mentions.map((x) => x.fullHandle);
        const mentionRe = new RegExp(`@(${handles.join('|')})`, 'g');
        return [
            [stripMarkdown, { keep: ['strong', 'emphasis', 'inlineCode'] }],
            remarkBreaks,
            // Make sure Mention plugin is before URL plugin, to avoid matching
            // mentioned ens handle as url. For example, @mask.eth should be treat
            // as a mention rather than link
            linkifyRegex(mentionRe),
            linkifyRegex(URL_REGEX),
            linkifyRegex(HASHTAG_REGEX),
        ];
    }, [post?.mentions]);
    if (!children) return null;

    return (
        <ReactMarkdown
            {...rest}
            remarkPlugins={plugins}
            components={{
                // @ts-ignore
                // eslint-disable-next-line react/no-unstable-nested-components
                a: (props) => <MarkupLink title={props.title} post={post} />,
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

const bioPlugins = [
    [stripMarkdown, { keep: ['strong', 'emphasis', 'inlineCode'] }],
    remarkBreaks,
    linkifyRegex(MENTION_REGEX),
    linkifyRegex(HASHTAG_REGEX),
    linkifyRegex(BIO_TWITTER_PROFILE_REGEX),
    linkifyRegex(URL_REGEX),
];

export const BioMarkup = memo<MarkupProps>(function Markup({ children, post, ...rest }) {
    if (!children) return null;

    return (
        <ReactMarkdown
            {...rest}
            remarkPlugins={bioPlugins}
            components={{
                // @ts-ignore
                // eslint-disable-next-line react/no-unstable-nested-components
                a: (props) => <MarkupLink title={props.title} post={post} />,
                code: Code,
                ...rest.components,
            }}
        >
            {trimify(children)}
        </ReactMarkdown>
    );
});
