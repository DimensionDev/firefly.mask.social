import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { first, isUndefined } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { memo } from 'react';
import { useMount } from 'react-use';
import urlcat from 'urlcat';

import ArticleAnchorIcon from '@/assets/article-anchor.svg';
import { ArticleHeader } from '@/components/Article/ArticleHeader.js';
import { FeedFollowSource } from '@/components/FeedFollowSource.js';
import { ArticleMarkup } from '@/components/Markup/ArticleMarkup.js';
import { CollapsedContent } from '@/components/Posts/CollapsedContent.js';
import { ImageAsset } from '@/components/Posts/ImageAsset.js';
import { queryClient } from '@/configs/queryClient.js';
import { IS_APPLE, IS_SAFARI } from '@/constants/bowser.js';
import { classNames } from '@/helpers/classNames.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getArticleUrl } from '@/helpers/getArticleUrl.js';
import { PreviewImageModalRef } from '@/modals/controls.js';
import { type Article, ArticlePlatform, ArticleType } from '@/providers/types/Article.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import type { ResponseJSON } from '@/types/index.js';
import { type LinkDigested, PayloadType } from '@/types/og.js';

export interface SingleArticleProps {
    article: Article;
    disableAnimate?: boolean;
    listKey?: string;
    index?: number;
}

export const SingleArticle = memo<SingleArticleProps>(function SingleArticleProps({
    article,
    disableAnimate,
    listKey,
    index,
}) {
    const router = useRouter();
    const setScrollIndex = useGlobalState.use.setScrollIndex();

    const cover = useQuery({
        queryKey: ['article', 'cover', article.id],
        queryFn: async () => {
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
            return null;
        },
    });

    useMount(() => {
        if (!article.id) return;
        queryClient.setQueryData(['article-detail', article.id], article);
    });

    const isMuted = article.author.isMuted;
    return (
        <motion.article
            initial={!disableAnimate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={classNames(
                'border-b border-line bg-bottom px-3 py-2 hover:bg-bg max-md:px-4 max-md:py-3 md:px-4 md:py-3',
                {
                    'cursor-pointer': !isMuted,
                },
            )}
            onClick={() => {
                if (isMuted) return;
                const selection = window.getSelection();
                if (selection && selection.toString().length !== 0) return;
                if (listKey && !isUndefined(index)) setScrollIndex(listKey, index);

                router.push(getArticleUrl(article));
                return;
            }}
        >
            <FeedFollowSource source={first(article.followingSources)} />
            <ArticleHeader article={article} />
            {isMuted ? (
                <CollapsedContent className="mt-2 pl-[52px]" authorMuted isQuote={false} />
            ) : (
                <div className="-mt-2 pl-[52px]">
                    <div className="flex items-center gap-1 text-[15px]">
                        <ArticleAnchorIcon width={18} height={18} />
                        <span className="flex items-center gap-1 text-secondary">
                            {article.type === ArticleType.Revise ? (
                                <Trans>
                                    <strong className="text-main">Revised</strong>
                                    an article
                                </Trans>
                            ) : (
                                <Trans>
                                    <strong className="text-main">Posted</strong>
                                    an article
                                </Trans>
                            )}
                        </span>
                    </div>
                    <div className="relative mt-[6px] flex flex-col gap-2 overflow-hidden rounded-2xl border border-secondaryLine bg-bg p-3">
                        {cover.data ? (
                            <ImageAsset
                                disableLoadHandler
                                src={cover.data}
                                width={510}
                                height={260}
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
                        <div
                            className={classNames('line-clamp-2 text-base font-bold leading-[20px]', {
                                'max-h-[40px]': IS_SAFARI && IS_APPLE,
                            })}
                        >
                            {article.title}
                        </div>
                        {article.content ? (
                            <div className="h-[100px]">
                                <ArticleMarkup
                                    disableImage
                                    className="markup linkify break-words text-sm leading-[18px] text-second"
                                >
                                    {article.content}
                                </ArticleMarkup>
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
                    </div>
                </div>
            )}
        </motion.article>
    );
});
