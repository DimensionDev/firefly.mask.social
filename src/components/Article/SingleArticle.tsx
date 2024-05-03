import { motion } from 'framer-motion';
import { isUndefined } from 'lodash-es';
import { memo } from 'react';

import { ArticleHeader } from '@/components/Article/ArticleHeader.js';
import type { Article } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

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
    const setScrollIndex = useGlobalState.use.setScrollIndex();
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

                return;
            }}
        >
            <ArticleHeader article={article} />
        </motion.article>
    );
});
