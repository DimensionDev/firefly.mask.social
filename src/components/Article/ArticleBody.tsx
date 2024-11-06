'use client';

import '@/assets/css/limo.css';
import '@/assets/css/paragraph.css';

import DOMPurify from 'dompurify';
import { useRouter } from 'next/navigation.js';

import { ArticleActions } from '@/components/Article/ArticleActions.js';
import { ArticleAuthor } from '@/components/Article/ArticleAuthor.jsx';
import { ClickableArea } from '@/components/ClickableArea.js';
import { ArticleMarkup } from '@/components/Markup/ArticleMarkup.js';
import { ImageAsset } from '@/components/Posts/ImageAsset.js';
import { IS_APPLE, IS_SAFARI } from '@/constants/bowser.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveSearchUrl } from '@/helpers/resolveSearchUrl.js';
import { useIsDarkMode } from '@/hooks/useIsDarkMode.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { PreviewMediaModalRef } from '@/modals/controls.js';
import { type Article, ArticlePlatform } from '@/providers/types/Article.js';

interface Props {
    cover?: string;
    article: Article;
    onClick?: () => void;
}

export function ArticleBody({ cover, article, onClick }: Props) {
    const isMedium = useIsMedium();
    const router = useRouter();

    const isDarkMode = useIsDarkMode();

    return (
        <ClickableArea
            as="article"
            onClick={onClick}
            className={classNames(
                'relative mt-[6px] flex flex-col gap-2 rounded-2xl border border-secondaryLine bg-bg p-3',
                {
                    'overflow-hidden': !!article.content,
                },
            )}
        >
            {cover ? (
                <ImageAsset
                    disableLoadHandler
                    src={cover}
                    width={510}
                    height={260}
                    className="mb-3 w-full cursor-pointer rounded-lg object-cover"
                    alt={cover}
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();

                        if (cover)
                            PreviewMediaModalRef.open({
                                medias: [{ type: 'Image', uri: cover }],
                                index: 0,
                                source: Source.Article,
                            });
                    }}
                />
            ) : null}
            <h1
                className={classNames('line-clamp-2 text-left text-[18px] font-bold leading-[20px]', {
                    'max-h-[40px]': IS_SAFARI && IS_APPLE,
                })}
            >
                {article.title}
            </h1>
            <div className="flex items-center">
                {article.slug ? (
                    <div
                        className="cursor-pointer rounded-lg bg-primaryBottom px-1 py-2 text-xs text-second hover:underline"
                        onClick={(event) => {
                            event.stopPropagation();
                            event.preventDefault();

                            scrollTo(0, 0);
                            router.push(resolveSearchUrl(article.slug || '', undefined, Source.Article));
                        }}
                    >
                        #{article.slug}
                    </div>
                ) : null}
            </div>
            <div className="flex items-center justify-between border-b border-secondaryLine pb-[10px]">
                <ArticleAuthor article={article} />
                {isMedium ? <ArticleActions article={article} /> : null}
            </div>
            {article.content ? (
                <div className="h-[100px]">
                    {article.platform !== ArticlePlatform.Mirror ? (
                        <div
                            className={classNames({
                                'limo-article': article.platform === ArticlePlatform.Limo,
                                'paragraph-article': article.platform === ArticlePlatform.Paragraph,
                            })}
                        >
                            {/*  The content returned by limo is html. */}
                            <div
                                className={classNames('container-fluid markdown-body comment-enabled', {
                                    dark: isDarkMode,
                                })}
                                // eslint-disable-next-line react/no-danger
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
                            />
                        </div>
                    ) : (
                        <ArticleMarkup
                            disableImage
                            className="markup linkify break-words text-sm leading-[18px] text-second"
                        >
                            {article.content}
                        </ArticleMarkup>
                    )}
                    <div
                        className="absolute bottom-0 left-0 h-[100px] w-full"
                        style={{
                            background: `linear-gradient(
                            to top,
                            rgba(var(--background-end-rgb), 1) 0%,
                            rgba(var(--background-end-rgb), 0.3) 50%,
                            rgba(var(--background-end-rgb), 0.15) 65%,
                            rgba(var(--background-end-rgb), 0.075) 75.5%,
                            rgba(var(--background-end-rgb), 0.037) 82.85%,
                            rgba(var(--background-end-rgb), 0.019) 88%,
                            rgba(var(--background-end-rgb), 0) 100%
                          )`,
                        }}
                    />
                </div>
            ) : null}
        </ClickableArea>
    );
}
