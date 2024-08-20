'use client';

import { t, Trans } from '@lingui/macro';
import { motion } from 'framer-motion';
import { memo } from 'react';

import CollectIcon from '@/assets/collect.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { CollectArticleModalRef } from '@/modals/controls.js';
import { type Article, ArticlePlatform } from '@/providers/types/Article.js';

interface ArticleActionsProps {
    article: Article;
}

export const ArticleActions = memo<ArticleActionsProps>(function ArticleActions({ article }) {
    return (
        <div className="flex items-center justify-between">
            <div className="text-xs leading-[24px] text-second">
                <div className="flex gap-1">
                    <strong>123</strong>
                    <span>
                        <Trans>collected</Trans>
                    </span>
                </div>
                {article.slug ? <div className="text-second">#{article.slug}</div> : null}
            </div>
            <div className="flex items-center">
                <ClickableArea
                    className={classNames(
                        'flex w-min items-center text-lightSecond hover:text-primaryPink md:space-x-2',
                    )}
                >
                    {!(article.platform === ArticlePlatform.Paragraph && !article.origin) ? (
                        <Tooltip content={t`Collect`} placement="top">
                            <motion.button
                                onClick={() => {
                                    CollectArticleModalRef.open({
                                        article,
                                    });
                                }}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-primaryPink/[.20]"
                                whileTap={{ scale: 0.9 }}
                            >
                                <CollectIcon width={17} height={16} />
                            </motion.button>
                        </Tooltip>
                    ) : null}
                </ClickableArea>
            </div>
        </div>
    );
});
