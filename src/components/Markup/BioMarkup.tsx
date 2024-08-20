'use client';

import { compact } from 'lodash-es';
import { type HTMLProps, memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
// @ts-expect-error
import linkifyRegex from 'remark-linkify-regex';
import stripMarkdown from 'strip-markdown';

import { Code } from '@/components/Code.js';
import type { MarkupProps } from '@/components/Markup/Markup.js';
import { MarkupLink } from '@/components/Markup/MarkupLink/index.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import {
    BIO_TWITTER_PROFILE_REGEX,
    CHANNEL_REGEX,
    HASHTAG_REGEX,
    MENTION_REGEX,
    SYMBOL_REGEX,
    URL_REGEX,
} from '@/constants/regexp.js';
import { trimify } from '@/helpers/trimify.js';

interface BioMarkupProps extends MarkupProps {
    source?: SocialSource;
}

export const BioMarkup = memo<BioMarkupProps>(function BioMarkup({ children, post, source, ...rest }) {
    const bioPlugins = useMemo(() => {
        return compact([
            [stripMarkdown, { keep: ['strong', 'emphasis', 'inlineCode'] }],
            remarkBreaks,
            linkifyRegex(MENTION_REGEX),
            linkifyRegex(HASHTAG_REGEX),
            linkifyRegex(SYMBOL_REGEX),
            linkifyRegex(BIO_TWITTER_PROFILE_REGEX),
            linkifyRegex(URL_REGEX),
            source === Source.Farcaster ? linkifyRegex(CHANNEL_REGEX) : undefined,
        ]);
    }, [source]);

    const LinkComponent = useMemo(() => {
        return function Link(props: HTMLProps<HTMLAnchorElement>) {
            const matched = props.title?.startsWith('@') && props.title.endsWith('.');

            const title = matched ? props.title?.slice(0, -1) : props.title;

            return (
                <>
                    <MarkupLink title={title} post={post} source={source} />
                    {matched ? '.' : null}
                </>
            );
        };
    }, [post, source]);

    if (!children) return null;

    return (
        <ReactMarkdown
            {...rest}
            remarkPlugins={bioPlugins}
            components={{
                a: LinkComponent,
                code: Code,
                ...rest.components,
            }}
        >
            {trimify(children)}
        </ReactMarkdown>
    );
});
