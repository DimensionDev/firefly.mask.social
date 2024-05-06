'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { type Options as ReactMarkdownOptions } from 'react-markdown';
import remarkBreaks from 'remark-breaks';
// @ts-expect-error
import linkifyRegex from 'remark-linkify-regex';
import stripMarkdown from 'strip-markdown';

import { Code } from '@/components/Code.js';
import { MarkupLink } from '@/components/Markup/MarkupLink/index.js';
import { ImageAsset } from '@/components/Posts/ImageAsset.js';
import { BIO_TWITTER_PROFILE_REGEX, URL_REGEX } from '@/constants/regex.js';
import { classNames } from '@/helpers/classNames.js';
import { trimify } from '@/helpers/trimify.js';
import { PreviewImageModalRef } from '@/modals/controls.js';

const PLUGINS = [
    [stripMarkdown, { keep: ['strong', 'emphasis', 'inlineCode', 'image'] }],
    remarkBreaks,
    linkifyRegex(BIO_TWITTER_PROFILE_REGEX),
    linkifyRegex(URL_REGEX),
];

interface ArticleMarkupProps extends Omit<ReactMarkdownOptions, 'children'> {
    children: ReactMarkdownOptions['children'] | null;
    disableImage?: boolean;
}

export const ArticleMarkup = memo<ArticleMarkupProps>(function ArticleMarkup({ children, disableImage, ...rest }) {
    if (!children) return null;

    return (
        <ReactMarkdown
            {...rest}
            remarkPlugins={PLUGINS}
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
