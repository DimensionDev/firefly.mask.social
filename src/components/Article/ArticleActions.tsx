'use client';

import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { useEnsName } from 'wagmi';

import CollectIcon from '@/assets/collect.svg';
import { Bookmark } from '@/components/Actions/Bookmark.js';
import { ArticleCollect } from '@/components/Article/ArticleCollect.js';
import { ArticleShare } from '@/components/Article/ArticleShare.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tips } from '@/components/Tips/index.js';
import { Tooltip } from '@/components/Tooltip.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { useFireflyIdentity } from '@/hooks/useFireflyIdentity.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useToggleArticleBookmark } from '@/hooks/useToggleArticleBookmark.js';
import { CollectArticleModalRef, DraggablePopoverRef } from '@/modals/controls.js';
import { type Article, ArticlePlatform } from '@/providers/types/Article.js';

interface ArticleActionsProps {
    article: Article;
}

export const ArticleActions = memo<ArticleActionsProps>(function ArticleActions({ article }) {
    const mutation = useToggleArticleBookmark();
    const identity = useFireflyIdentity(Source.Wallet, article.author.id);
    const { data: ens } = useEnsName({ address: article.author.id });
    const isMedium = useIsMedium();
    return (
        <div className="flex items-center justify-between">
            <div className="text-xs leading-[24px] text-second">
                {article.slug ? <div className="text-second">#{article.slug}</div> : null}
            </div>
            <div className="flex items-center">
                <ClickableArea
                    className={classNames(
                        'flex w-min items-center text-lightSecond hover:text-secondarySuccess md:space-x-2',
                    )}
                >
                    {!(article.platform === ArticlePlatform.Paragraph && !article.origin) ? (
                        <Tooltip content={t`Collect`} placement="top">
                            <motion.button
                                onClick={() => {
                                    if (isMedium) {
                                        CollectArticleModalRef.open({
                                            article,
                                        });
                                    } else {
                                        DraggablePopoverRef.open({
                                            content: <ArticleCollect article={article} />,
                                        });
                                    }
                                }}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-secondarySuccess/[.20]"
                                whileTap={{ scale: 0.9 }}
                            >
                                <CollectIcon width={17} height={16} />
                            </motion.button>
                        </Tooltip>
                    ) : null}
                </ClickableArea>
                <Bookmark hiddenCount hasBookmarked={article.hasBookmarked} onClick={() => mutation.mutate(article)} />
                <Tips
                    identity={identity}
                    handle={article.author.handle || ens}
                    tooltipDisabled
                    onClick={close}
                    pureWallet
                />
                {article.origin ? <ArticleShare article={article} /> : null}
            </div>
        </div>
    );
});
