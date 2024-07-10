'use client';

import { memo, useRef } from 'react';
import ReactMarkdown, { type Options as ReactMarkdownOptions } from 'react-markdown';
import remarkBreaks from 'remark-breaks';
// @ts-expect-error
import linkifyRegex from 'remark-linkify-regex';
import stripMarkdown from 'strip-markdown';

import { Code } from '@/components/Code.js';
import { MarkupLink } from '@/components/Markup/MarkupLink/index.js';
import { ImageAsset, type ImageAssetProps } from '@/components/Posts/ImageAsset.js';
import { Source } from '@/constants/enum.js';
import { BIO_TWITTER_PROFILE_REGEX, URL_REGEX } from '@/constants/regexp.js';
import { classNames } from '@/helpers/classNames.js';
import { trimify } from '@/helpers/trimify.js';
import { PreviewMediaModalRef } from '@/modals/controls.js';

const PLUGINS = [
    [stripMarkdown, { keep: ['strong', 'emphasis', 'inlineCode', 'image'] }],
    remarkBreaks,
    linkifyRegex(BIO_TWITTER_PROFILE_REGEX),
    linkifyRegex(URL_REGEX),
];

interface ArticleMarkupProps extends Omit<ReactMarkdownOptions, 'children'> {
    children: ReactMarkdownOptions['children'] | null;
    disableImage?: boolean;
    imageProps?: Partial<ImageAssetProps>;
}

export const ArticleMarkup = memo<ArticleMarkupProps>(function ArticleMarkup({
    children,
    disableImage,
    imageProps,
    ...rest
}) {
    const images = useRef<string[]>([]);
    if (!children) return null;

    return (
        <ReactMarkdown
            {...rest}
            remarkPlugins={PLUGINS}
            components={{
                // @ts-ignore
                // eslint-disable-next-line react/no-unstable-nested-components
                a: (props) => <MarkupLink title={props.title} supportTweet />,
                code: Code,
                // @ts-ignore
                // eslint-disable-next-line react/no-unstable-nested-components
                img: (props) => {
                    if (!props.src || disableImage) return null;
                    images.current = !images.current.includes(props.src)
                        ? [...images.current, props.src]
                        : images.current;
                    const index = images.current.findIndex((uri) => uri === props.src);
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
                                PreviewMediaModalRef.open({
                                    index: `${Math.max(index, 0)}`,
                                    medias: images.current.map((uri) => ({ type: 'Image', uri })),
                                    source: Source.Article,
                                });
                            }}
                            {...imageProps}
                            style={{
                                width: 'auto',
                                height: 'auto',
                                maxWidth: '100%',
                                ...imageProps?.style,
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
