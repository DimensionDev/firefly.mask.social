'use client';

import '@/assets/css/limo.css';
import '@/assets/css/paragraph.css';

import { Trans } from '@lingui/macro';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import { compact } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { useRef } from 'react';
import { useDarkMode } from 'usehooks-ts';

import ComeBack from '@/assets/comeback.svg';
import { ArticleHeader } from '@/components/Article/ArticleHeader.js';
import { ArticleMarkup } from '@/components/Markup/ArticleMarkup.js';
import { CollapsedContent } from '@/components/Posts/CollapsedContent.js';
import { ImageAsset } from '@/components/Posts/ImageAsset.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { openWindow } from '@/helpers/openWindow.js';
import { resolveSearchUrl } from '@/helpers/resolveSearchUrl.js';
import { useComeBack } from '@/hooks/useComeback.js';
import { PreviewMediaModalRef } from '@/modals/controls.js';
import { FireflyArticleProvider } from '@/providers/firefly/Article.js';
import { ArticlePlatform } from '@/providers/types/Article.js';
import type { Attachment } from '@/providers/types/SocialMedia.js';
import { getArticleCover } from '@/services/getArticleCover.js';

interface PageProps {
    params: {
        id: string;
    };
}

export function ArticleDetailPage({ params: { id: articleId } }: PageProps) {
    const router = useRouter();
    const ref = useRef<HTMLDivElement>(null);
    const comeback = useComeBack();
    const { isDarkMode } = useDarkMode();
    const { data: article } = useSuspenseQuery({
        queryKey: ['article-detail', articleId],
        queryFn: async () => {
            if (!articleId) return;

            return FireflyArticleProvider.getArticleById(articleId);
        },
    });

    const isMuted = article?.author.isMuted;

    const cover = useQuery({
        enabled: !isMuted,
        queryKey: ['article', 'cover', article?.id],
        queryFn: async () => {
            return article ? await getArticleCover(article) : null;
        },
    });

    if (!article) return null;

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-40 flex items-center bg-primaryBottom px-4 py-[18px]">
                <ComeBack width={24} height={24} className="mr-8 cursor-pointer" onClick={comeback} />
                <h2 className="text-xl font-black leading-6">
                    <Trans>Details</Trans>
                </h2>
            </div>

            <div className="px-4">
                {cover.data && !isMuted ? (
                    <ImageAsset
                        src={cover.data}
                        width={510}
                        height={260}
                        priority
                        className="mb-3 w-full cursor-pointer rounded-lg object-cover"
                        alt={cover.data}
                        onClick={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            if (cover.data)
                                PreviewMediaModalRef.open({
                                    medias: [{ type: 'Image', uri: cover.data }],
                                    index: 0,
                                    source: Source.Article,
                                });
                        }}
                    />
                ) : null}
                {!isMuted ? <div className="line-clamp-5 text-2xl font-semibold">{article.title}</div> : null}
                <div className="mt-1 flex items-center gap-2">
                    {article.origin ? (
                        <Link
                            href={article.origin}
                            className="flex items-center gap-1 text-xs text-link hover:underline"
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            <Trans>View Source</Trans>
                        </Link>
                    ) : null}

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
                <div className="my-5 mt-2 border-b border-line">
                    <ArticleHeader article={article} className="items-center pb-2" />
                </div>
                {isMuted ? (
                    <CollapsedContent className="mt-2" authorMuted isQuote={false} />
                ) : article.platform !== ArticlePlatform.Mirror ? (
                    <div
                        className={classNames({
                            'limo-article': article.platform === ArticlePlatform.Limo,
                            'paragraph-article': article.platform === ArticlePlatform.Paragraph,
                        })}
                    >
                        {/*  The content returned by limo is html. */}
                        <div
                            ref={ref}
                            className={classNames('container-fluid markdown-body comment-enabled', {
                                dark: isDarkMode,
                            })}
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
                            onClick={(event) => {
                                event.stopPropagation();
                                event.preventDefault();

                                if ((event.target as HTMLElement).tagName === 'A') {
                                    const link = event.target as HTMLAnchorElement;
                                    if (link.href) {
                                        openWindow(link.href, '_blank', { opener: false, referrer: false });
                                        return;
                                    }
                                }

                                if ((event.target as HTMLElement).tagName !== 'IMG' || !ref.current) return;

                                const image = event.target as HTMLImageElement;

                                if (!image.classList.contains('embed') && !image.classList.contains('zora-embed'))
                                    return;

                                const nodes = ref.current?.querySelectorAll('.embed, .zora-embed');
                                const medias = compact(
                                    [...nodes.values()].map((x) => {
                                        const src = x.getAttribute('src');
                                        if (!src) return;
                                        return {
                                            type: 'Image',
                                            uri: src,
                                        };
                                    }),
                                ) as Attachment[];

                                const index = medias.findIndex((x) => image.src === x.uri);

                                PreviewMediaModalRef.open({
                                    index: Math.max(index, 0),
                                    medias,
                                    source: Source.Article,
                                });
                            }}
                        />
                    </div>
                ) : (
                    <ArticleMarkup
                        linkProps={{ sourceLink: article.origin }}
                        className="markup linkify break-words text-medium"
                        imageProps={{ disableLoadHandler: true, style: { objectFit: 'cover' } }}
                    >
                        {article.content}
                    </ArticleMarkup>
                )}

                {/* article bottom padding */}
                <div className="py-4" />
            </div>
        </div>
    );
}
