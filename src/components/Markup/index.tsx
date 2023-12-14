'use client';
import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { type Options as ReactMarkdownOptions } from 'react-markdown';
import remarkBreaks from 'remark-breaks';
// @ts-expect-error
import linkifyRegex from 'remark-linkify-regex';
import stripMarkdown from 'strip-markdown';

import { Code } from '@/components/Code.js';
import { HASHTAG_REGEX, MENTION_REGEX, URL_REGEX } from '@/constants/regex.js';
import type { Post } from '@/providers/types/SocialMedia.js';

import { MarkupLink } from './MarkupLink/index.js';

const trimify = (value: string): string => value?.replace(/\n\n\s*\n/g, '\n\n').trim();

const plugins = [
    [stripMarkdown, { keep: ['strong', 'emphasis', 'inlineCode'] }],
    remarkBreaks,
    linkifyRegex(URL_REGEX),
    linkifyRegex(MENTION_REGEX),
    linkifyRegex(HASHTAG_REGEX),
];

interface MarkupProps extends Omit<ReactMarkdownOptions, 'children'> {
    children?: ReactMarkdownOptions['children'] | null;
    post: Post;
}

export const Markup = memo<MarkupProps>(function Markup({ children, post, ...rest }) {
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
