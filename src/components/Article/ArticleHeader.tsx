'use client';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { memo } from 'react';
import urlcat from 'urlcat';

import { ArticleMoreAction } from '@/components/Actions/ArticleMore.js';
import { Avatar } from '@/components/Avatar.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveArticlePlatformIcon } from '@/helpers/resolveArticlePlatformIcon.js';
import type { Article } from '@/providers/types/Article.js';

interface ArticleHeaderProps {
    article: Article;
    className?: string;
}

export const ArticleHeader = memo<ArticleHeaderProps>(function ArticleHeader({ article, className }) {
    const authorUrl = urlcat('/profile/:address', {
        address: article.author.id,
        source: SourceInURL.Wallet,
    });

    const Icon = resolveArticlePlatformIcon(article.platform);

    return (
        <div className={classNames('flex items-start gap-3', className)}>
            <Link href={authorUrl} className="z-[1]" onClick={(event) => event.stopPropagation()}>
                <Avatar
                    className="h-10 w-10"
                    src={article.author.avatar}
                    size={40}
                    alt={article.author.handle || article.author.id}
                />
            </Link>

            <div className="flex max-w-[calc(100%-40px-88px-24px)] flex-1 items-center gap-2 overflow-hidden">
                <Link
                    href={authorUrl}
                    onClick={(event) => event.stopPropagation()}
                    className="block truncate text-clip text-[15px] font-bold leading-5 text-main"
                >
                    {article.author.handle}
                </Link>
                <Link href={authorUrl} className="truncate text-clip text-[15px] leading-6 text-secondary">
                    {formatEthereumAddress(article.author.id, 4)}
                </Link>
            </div>
            <div className="ml-auto flex items-center space-x-2">
                {Icon ? <Icon width={20} height={20} /> : null}
                <span className="whitespace-nowrap text-xs leading-4 text-secondary md:text-[13px]">
                    <TimestampFormatter time={article.timestamp} />
                </span>
                <ArticleMoreAction article={article} />
                {/* TODO: report and mute */}
            </div>
        </div>
    );
});
