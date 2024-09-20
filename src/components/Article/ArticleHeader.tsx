import { memo } from 'react';
import urlcat from 'urlcat';
import { useEnsName } from 'wagmi';

import { ArticleActions } from '@/components/Article/ArticleActions.js';
import { Avatar } from '@/components/Avatar.js';
import { Time } from '@/components/Semantic/Time.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
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

    const { data: ens } = useEnsName({ address: article.author.id, query: { enabled: !article.author.handle } });

    return (
        <div
            className={classNames(
                'flex items-center justify-between border-b border-secondaryLine pb-[10px]',
                className,
            )}
        >
            <div className="flex items-center gap-2">
                <Link href={authorUrl} className="z-[1]">
                    <Avatar
                        className="h-[15px] w-[15px]"
                        src={article.author.avatar}
                        size={15}
                        alt={article.author.handle || article.author.id}
                    />
                </Link>
                <Link
                    href={authorUrl}
                    onClick={(event) => event.stopPropagation()}
                    className="block truncate text-clip text-medium leading-5 text-secondary"
                >
                    {article.author.handle || ens || formatEthereumAddress(article.author.id, 4)}
                </Link>
                <Time
                    dateTime={article.timestamp}
                    className="whitespace-nowrap text-medium text-xs leading-4 text-secondary"
                >
                    <TimestampFormatter time={article.timestamp} />
                </Time>
                {Icon ? <Icon width={15} height={15} /> : null}
            </div>
            <ArticleActions article={article} />
        </div>
    );
});
