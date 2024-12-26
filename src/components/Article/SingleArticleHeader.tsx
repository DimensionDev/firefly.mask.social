'use client';

import { memo } from 'react';
import urlcat from 'urlcat';
import { useEnsName } from 'wagmi';

import { ArticleMoreAction } from '@/components/Actions/ArticleMore.js';
import { ActivityCellHeader } from '@/components/ActivityCell/ActivityCellHeader.js';
import { Avatar } from '@/components/Avatar.js';
import { SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveArticlePlatformIcon } from '@/helpers/resolveArticlePlatformIcon.js';
import { stopPropagation } from '@/helpers/stopEvent.js';
import { type Article, ArticlePlatform } from '@/providers/types/Article.js';

interface SingleArticleHeaderProps {
    article: Article;
    className?: string;
    isBookmark?: boolean;
}

export const SingleArticleHeader = memo<SingleArticleHeaderProps>(function SingleArticleHeader({
    article,
    className,
    isBookmark,
}) {
    const authorUrl = urlcat('/profile/:address', {
        address: article.author.id,
        source: SourceInURL.Wallet,
    });

    const Icon = !isBookmark ? resolveArticlePlatformIcon(article.platform) : null;
    const size = article.platform === ArticlePlatform.Limo ? 15 : 20;
    const { data: ens } = useEnsName({ address: article.author.id, query: { enabled: !article.author.handle } });

    return (
        <header className={classNames('flex w-full items-start gap-3', className)}>
            <Link href={authorUrl} className="z-[1]" onClick={stopPropagation}>
                <Avatar
                    className="h-10 w-10"
                    src={article.author.avatar}
                    size={40}
                    alt={article.author.handle || article.author.id}
                />
            </Link>

            <ActivityCellHeader
                className="w-full"
                address={article.author.id}
                displayName={article.author.handle || ens}
                time={!isBookmark ? article.timestamp : undefined}
                icon={Icon ? <Icon width={size} height={size} /> : null}
            >
                {!isBookmark ? <ArticleMoreAction article={article} /> : null}
            </ActivityCellHeader>
        </header>
    );
});
