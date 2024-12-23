'use client';

import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { memo } from 'react';
import urlcat from 'urlcat';
import { useEnsName } from 'wagmi';

import CollectIcon from '@/assets/collect.svg';
import { Bookmark } from '@/components/Actions/Bookmark.js';
import { ShareAction } from '@/components/Actions/ShareAction.js';
import { ArticleCollect } from '@/components/Article/ArticleCollect.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tips } from '@/components/Tips/index.js';
import { Tooltip } from '@/components/Tooltip.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { getArticleUrl } from '@/helpers/getArticleUrl.js';
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
    const url = urlcat(location.origin, getArticleUrl(article));
    return (
        <div className="flex items-center justify-end">
            <div className="flex items-center">
                <ClickableArea
                    className={classNames(
                        'flex w-min items-center text-lightSecond hover:text-secondarySuccess md:space-x-2',
                    )}
                >
                    {!(article.platform === ArticlePlatform.Paragraph && !article.origin) &&
                    article.platform !== ArticlePlatform.Limo ? (
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
                {url ? <ShareAction link={url} /> : null}
            </div>
        </div>
    );
});
