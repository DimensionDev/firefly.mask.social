'use client';

import { compact } from 'lodash-es';
import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { type Options as ReactMarkdownOptions } from 'react-markdown';
import remarkBreaks from 'remark-breaks';
// @ts-expect-error
import linkifyRegex from 'remark-linkify-regex';
import stripMarkdown from 'strip-markdown';

import { Code } from '@/components/Code.js';
import { MarkupLink } from '@/components/Markup/MarkupLink/index.js';
import { ImageAsset } from '@/components/Posts/ImageAsset.js';
import { SocialPlatform } from '@/constants/enum.js';
import {
    BIO_TWITTER_PROFILE_REGEX,
    CHANNEL_REGEX,
    HASHTAG_REGEX,
    MENTION_REGEX,
    URL_REGEX,
} from '@/constants/regex.js';
import { classNames } from '@/helpers/classNames.js';
import { PreviewImageModalRef } from '@/modals/controls.js';
import type { Post } from '@/providers/types/SocialMedia.js';

const trimify = (value: string): string => value.replace(/\n\n\s*\n/g, '\n\n').trim();

interface MarkupProps extends Omit<ReactMarkdownOptions, 'children'> {
    children?: ReactMarkdownOptions['children'] | null;
    post?: Post;
}

export const Markup = memo<MarkupProps>(function Markup({ children, post, ...rest }) {
    const plugins = useMemo(() => {
        if (!post?.mentions?.length)
            return compact([
                [stripMarkdown, { keep: ['strong', 'emphasis', 'inlineCode'] }],
                remarkBreaks,
                post?.source === SocialPlatform.Farcaster ? linkifyRegex(CHANNEL_REGEX) : undefined,
                linkifyRegex(URL_REGEX),
                linkifyRegex(HASHTAG_REGEX),
            ]);
        const handles = post.mentions.map((x) => x.fullHandle);
        const mentionRe = new RegExp(`@(${handles.join('|')})`, 'g');
        return compact([
            [stripMarkdown, { keep: ['strong', 'emphasis', 'inlineCode'] }],
            remarkBreaks,
            post?.source === SocialPlatform.Farcaster ? linkifyRegex(CHANNEL_REGEX) : undefined,
            // Make sure Mention plugin is before URL plugin, to avoid matching
            // mentioned ens handle as url. For example, @mask.eth should be treat
            // as a mention rather than link
            linkifyRegex(mentionRe),
            linkifyRegex(URL_REGEX),
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
                a: (props) => <MarkupLink title={props.title} post={post} source={post.source} />,
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

export interface BioMarkupProps extends MarkupProps {
    source?: SocialPlatform;
}

export const BioMarkup = memo<BioMarkupProps>(function Markup({ children, post, source, ...rest }) {
    const bioPlugins = useMemo(() => {
        return compact([
            [stripMarkdown, { keep: ['strong', 'emphasis', 'inlineCode'] }],
            remarkBreaks,
            source === SocialPlatform.Farcaster ? linkifyRegex(CHANNEL_REGEX) : undefined,
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

interface ArticleMarkupProps extends Omit<ReactMarkdownOptions, 'children'> {
    children: ReactMarkdownOptions['children'] | null;
    disableImage?: boolean
}

const articlePlugins = [
    [stripMarkdown, { keep: ['strong', 'emphasis', 'inlineCode', 'image'] }],
    remarkBreaks,
    linkifyRegex(BIO_TWITTER_PROFILE_REGEX),
    linkifyRegex(URL_REGEX),
];

export const ArticleMarkup = memo<ArticleMarkupProps>(function ArticleMarkup({ children, disableImage , ...rest }) {
    if (!children) return null;

    return (
        <ReactMarkdown
            {...rest}
            remarkPlugins={articlePlugins}
            components={{
                // @ts-ignore
                // eslint-disable-next-line react/no-unstable-nested-components
                a: (props) => <MarkupLink title={props.title} />,
                code: Code,
                // @ts-ignore
                // eslint-disable-next-line react/no-unstable-nested-components
                img: (props) => {
                    if (!props.src || disableImage) return null;
                    return (
                        <ImageAsset
                            className={classNames('cursor-pointer', props.className)}
                            src={props.src}
                            alt={props.src}
                            width={1000}
                            height={1000}
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                if (!props.src) return;
                                PreviewImageModalRef.open({
                                    current: props.src,
                                    images: [props.src],
                                });
                            }}
                        />
                    );
                },
                ...rest.components,
            }}
        >
            {trimify(children)}
        </ReactMarkdown>
    );
});
