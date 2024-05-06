'use client';
import { t, Trans } from '@lingui/macro';
import { EVMExplorerResolver } from '@masknet/web3-providers';
import { ChainId } from '@masknet/web3-shared-evm';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import urlcat from 'urlcat';
import { useDocumentTitle } from 'usehooks-ts';

import ComeBack from '@/assets/comeback.svg';
import { ArticleHeader } from '@/components/Article/ArticleHeader.js';
import { ArticleMarkup } from '@/components/Markup/ArticleMarkup.js';
import { ImageAsset } from '@/components/Posts/ImageAsset.js';
import { SITE_NAME } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { useComeBack } from '@/hooks/useComeback.js';
import { PreviewImageModalRef } from '@/modals/controls.js';
import { FireflyArticleProvider } from '@/providers/firefly/Article.js';
import { ArticlePlatform } from '@/providers/types/Article.js';
import type { ResponseJSON } from '@/types/index.js';
import { type LinkDigested, PayloadType } from '@/types/og.js';

interface PageProps {
    params: {
        id: string;
    };
}

export function ArticleDetailPage({ params: { id: articleId } }: PageProps) {
    const comeback = useComeBack();

    const { data: article } = useSuspenseQuery({
        queryKey: ['article-detail', articleId],
        queryFn: async () => {
            if (!articleId) return;

            return FireflyArticleProvider.getArticleDetailById(articleId);
        },
    });

    const cover = useQuery({
        queryKey: ['article', 'cover', article?.id],
        queryFn: async () => {
            if (!article) return;
            if (article.coverUrl) return article.coverUrl;
            if (article.platform === ArticlePlatform.Mirror && article.origin) {
                const payload = await fetchJSON<ResponseJSON<LinkDigested>>(
                    urlcat('/api/oembed', {
                        link: article.origin,
                    }),
                );
                if (payload.success && payload.data.payload?.type === PayloadType.Mirror) {
                    return payload.data.payload.cover;
                }
            }
            return;
        },
    });

    useDocumentTitle(article ? createPageTitle(t`Post by ${article.author.handle}`) : SITE_NAME);

    if (!article) return;

    const authorUrl = EVMExplorerResolver.addressLink(ChainId.Mainnet, article.author.id);
    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-40 flex items-center bg-primaryBottom px-4 py-[18px]">
                <ComeBack width={24} height={24} className="mr-8 cursor-pointer" onClick={comeback} />
                <h2 className="text-xl font-black leading-6">
                    <Trans>Details</Trans>
                </h2>
            </div>

            <div className="p-4">
                {cover.data ? (
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
                                PreviewImageModalRef.open({
                                    images: [cover.data],
                                    current: cover.data,
                                });
                        }}
                    />
                ) : null}

                <div className="text-2xl font-semibold">{article.title}</div>

                <div className="my-5 border-b border-secondaryLine">
                    <ArticleHeader article={article} className="pb-2" />
                </div>

                <ArticleMarkup className="markup linkify break-words text-[15px]">{article.content}</ArticleMarkup>

                {authorUrl ? (
                    <div className="mt-4 rounded-2xl border border-secondaryLine bg-bg p-2">
                        <div className="border-b border-secondaryLine pb-2 text-sm">
                            <Trans>This entry has been permanently stored on-chain and signed by its creator</Trans>
                        </div>

                        <Link rel="noreferrer noopener" target="_blank" href={authorUrl} className="mt-3 text-sm">
                            <div className="text-secondary">
                                <Trans>AUTHOR ADDRESS</Trans>
                            </div>
                            <div>{article.author.id}</div>
                        </Link>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
