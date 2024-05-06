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
import { type SocialSource, Source } from '@/constants/enum.js';
import {
    BIO_TWITTER_PROFILE_REGEX,
    CHANNEL_REGEX,
    HASHTAG_REGEX,
    MENTION_REGEX,
    URL_REGEX,
} from '@/constants/regex.js';
import { trimify } from '@/helpers/trimify.js';

interface BioMarkupProps extends MarkupProps {
    source?: SocialSource;
}

export const BioMarkup = memo<BioMarkupProps>(function Markup({ children, post, source, ...rest }) {
    const bioPlugins = useMemo(() => {
        return compact([
            [stripMarkdown, { keep: ['strong', 'emphasis', 'inlineCode'] }],
            remarkBreaks,
            source === Source.Farcaster ? linkifyRegex(CHANNEL_REGEX) : undefined,
            linkifyRegex(MENTION_REGEX),
            linkifyRegex(HASHTAG_REGEX),
            linkifyRegex(BIO_TWITTER_PROFILE_REGEX),
            linkifyRegex(URL_REGEX),
        ]);
    }, [source]);
    if (!children) return null;

    return (
        <ReactMarkdown
            {...rest}
            remarkPlugins={bioPlugins}
            components={{
                // @ts-ignore
                // eslint-disable-next-line react/no-unstable-nested-components
                a: (props) => <MarkupLink title={props.title} post={post} source={source} />,
                code: Code,
                ...rest.components,
            }}
        >
            {trimify(children)}
        </ReactMarkdown>
    );
});
