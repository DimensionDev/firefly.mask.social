'use client';
import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
// @ts-expect-error
import linkifyRegex from 'remark-linkify-regex';
import stripMarkdown from 'strip-markdown';

import { Code } from '@/components/Code.js';
import { HASHTAG_REGEX, MENTION_REGEX, URL_REGEX } from '@/constants/regex.js';

import { MarkupLink } from './MarkupLink/index.js';

const trimify = (value: string): string => value?.replace(/\n\n\s*\n/g, '\n\n').trim();

const plugins = [
    [stripMarkdown, { keep: ['strong', 'emphasis', 'inlineCode'] }],
    remarkBreaks,
    linkifyRegex(URL_REGEX),
    linkifyRegex(MENTION_REGEX),
    linkifyRegex(HASHTAG_REGEX),
];

interface MarkupProps {
    children: string;
    className?: string;
}

export const Markup = memo<MarkupProps>(function Markup({ children, className }) {
    if (!children) return null;

    return (
        <ReactMarkdown
            className={className}
            components={{
                // @ts-ignore
                a: MarkupLink,
                code: Code,
            }}
            remarkPlugins={plugins}
        >
            {trimify(children)}
        </ReactMarkdown>
    );
});
