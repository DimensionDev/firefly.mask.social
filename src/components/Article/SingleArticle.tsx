import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { isUndefined } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { memo } from 'react';
import { useMount } from 'react-use';
import urlcat from 'urlcat';

import ArticleAnchorIcon from '@/assets/article-anchor.svg';
import { ArticleHeader } from '@/components/Article/ArticleHeader.js';
import { ArticleMarkup } from '@/components/Markup/ArticleMarkup.js';
import { ImageAsset } from '@/components/Posts/ImageAsset.js';
import { queryClient } from '@/configs/queryClient.js';
import { IS_APPLE, IS_SAFARI } from '@/constants/bowser.js';
import { classNames } from '@/helpers/classNames.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getArticleUrl } from '@/helpers/getArticleUrl.js';
import { resolveArticlePlatformIcon } from '@/helpers/resolveArticlePlatformIcon.js';
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
            return;
        },
    });

    useMount(() => {
        if (!article.id) return;
        queryClient.setQueryData(['article-detail', article.id], article);
    });

    const Icon = resolveArticlePlatformIcon(article.platform);

    return (
        <motion.article
            initial={!disableAnimate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cursor-pointer border-b border-line bg-bottom px-3 py-2 hover:bg-bg md:px-4 md:py-3"
            onClick={() => {
                const selection = window.getSelection();
                if (selection && selection.toString().length !== 0) return;
                if (listKey && !isUndefined(index)) setScrollIndex(listKey, index);

                router.push(getArticleUrl(article));
                return;
            }}
        >
            <ArticleHeader article={article} />

            <div className="-mt-2 pl-[52px]">
                <div className="flex items-center gap-1 text-[15px]">
                    <ArticleAnchorIcon width={18} height={18} />
                    <span className="flex items-center gap-1 text-secondary">
                        <strong className="text-main">
                            {article.type === ArticleType.Revise ? t`Revised` : t`Posted`}
                        </strong>
                        an article
                    </span>
                </div>
                <div className="mt-[6px] flex flex-col gap-2 rounded-2xl bg-bg p-3">
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
                            'max-h-[40px]': !!IS_SAFARI && !!IS_APPLE,
                        })}
                    >
                        {article.title}
                    </div>
                    <ArticleMarkup
                        disableImage
                        className={classNames(
                            'markup linkify line-clamp-5 break-words text-sm leading-[18px] text-second',
                            {
                                'max-h-[8rem]': !!IS_SAFARI && !!IS_APPLE,
                            },
                        )}
                    >
                        {article.content}
                    </ArticleMarkup>
                </div>
            </div>
        </motion.article>
    );
});
