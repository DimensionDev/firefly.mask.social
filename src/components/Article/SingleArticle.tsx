import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { isUndefined } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { memo } from 'react';
import urlcat from 'urlcat';

import { ArticleHeader } from '@/components/Article/ArticleHeader.js';
import { ArticleMarkup } from '@/components/Markup/index.js';
import { ImageAsset } from '@/components/Posts/ImageAsset.js';
import { queryClient } from '@/configs/queryClient.js';
import { IS_APPLE, IS_SAFARI } from '@/constants/bowser.js';
import { classNames } from '@/helpers/classNames.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getArticleUrl } from '@/helpers/getArticleUrl.js';
import { resolveArticlePlatformIcon } from '@/helpers/resolveArticlePlatformIcon.js';
import { PreviewImageModalRef } from '@/modals/controls.js';
import { type Article, ArticlePlatform, ArticleType } from '@/providers/types/SocialMedia.js';
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

                queryClient.setQueriesData(
                    {
                        queryKey: ['article-detail', article.id],
                    },
                    () => article,
                );

                router.push(getArticleUrl(article));
                return;
            }}
        >
            <ArticleHeader article={article} />

            <div className="pl-[52px]">
                {cover.data ? (
                    <ImageAsset
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
                <div className="text-xl font-semibold">{article.title}</div>
                <div className="mt-3 rounded-2xl border border-secondaryLine bg-bg p-3">
                    <ArticleMarkup
                        disableImage
                        className={classNames('markup linkify line-clamp-5 break-words text-[15px]', {
                            'max-h-[8rem]': !!IS_SAFARI && !!IS_APPLE,
                        })}
                    >
                        {article.content}
                    </ArticleMarkup>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[16px] text-secondary">
                    {Icon ? <Icon width={16} height={16} /> : null}

                    {article.type === ArticleType.Revise ? t`Revise on ` : t`Post on `}
                    <span className="capitalize">{article.platform}</span>
                </div>
            </div>
        </motion.article>
    );
});
