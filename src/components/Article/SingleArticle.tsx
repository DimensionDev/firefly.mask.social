import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { first, isUndefined } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { memo, useCallback } from 'react';
import { useMount } from 'react-use';
import urlcat from 'urlcat';

import { ActivityCellArticleAction } from '@/components/ActivityCell/Article/ActivityCellArticleAction.js';
import { ArticleBody } from '@/components/Article/ArticleBody.js';
import { SingleArticleHeader } from '@/components/Article/SingleArticleHeader.js';
import { FeedFollowSource } from '@/components/FeedFollowSource.js';
import { CollapsedContent } from '@/components/Posts/CollapsedContent.js';
import { queryClient } from '@/configs/queryClient.js';
import { classNames } from '@/helpers/classNames.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getArticleUrl } from '@/helpers/getArticleUrl.js';
import { type Article, ArticlePlatform } from '@/providers/types/Article.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import type { ResponseJSON } from '@/types/index.js';
import { type LinkDigested, PayloadType } from '@/types/og.js';

export interface SingleArticleProps {
    article: Article;
    disableAnimate?: boolean;
    listKey?: string;
    index?: number;
    isBookmark?: boolean;
}

export const SingleArticle = memo<SingleArticleProps>(function SingleArticleProps({
    article,
    disableAnimate,
    listKey,
    index,
    isBookmark,
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

    const handleClick = useCallback(() => {
        if (isMuted) return;
        const selection = window.getSelection();
        if (selection && selection.toString().length !== 0) return;
        if (listKey && !isUndefined(index)) setScrollIndex(listKey, index);

        router.push(getArticleUrl(article));
        return;
    }, [article, index, isMuted, listKey, router, setScrollIndex]);

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
            onClick={handleClick}
        >
            {!isBookmark ? <FeedFollowSource source={first(article.followingSources)} /> : null}
            <SingleArticleHeader article={article} isBookmark={isBookmark} />
            {isMuted ? (
                <CollapsedContent className="mt-2 pl-[52px]" authorMuted isQuote={false} />
            ) : (
                <div className="-mt-2 pl-[52px]">
                    {!isBookmark ? <ActivityCellArticleAction type={article.type} platform={article.platform} /> : null}
                    <ArticleBody onClick={handleClick} cover={cover?.data ?? undefined} article={article} />
                </div>
            )}
        </motion.article>
    );
});
