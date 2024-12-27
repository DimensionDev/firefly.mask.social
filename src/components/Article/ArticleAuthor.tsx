import urlcat from 'urlcat';
import { useEnsName } from 'wagmi';

import { Avatar } from '@/components/Avatar.js';
import { Link } from '@/components/Link.js';
import { Time } from '@/components/Semantic/Time.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { SourceInURL } from '@/constants/enum.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { resolveArticlePlatformIcon } from '@/helpers/resolveArticlePlatformIcon.js';
import { stopPropagation } from '@/helpers/stopEvent.js';
import type { Article } from '@/providers/types/Article.js';

interface Props {
    article: Article;
}
export function ArticleAuthor({ article }: Props) {
    const { data: ens } = useEnsName({ address: article.author.id, query: { enabled: !article.author.handle } });
    const Icon = resolveArticlePlatformIcon(article.platform);

    const authorUrl = article.author.id
        ? urlcat('/profile/:address', {
              address: article.author.id,
              source: SourceInURL.Wallet,
          })
        : '';

    const avatar = (
        <Avatar
            className="h-[15px] w-[15px]"
            src={article.author.avatar}
            size={15}
            alt={article.author.handle || article.author.id}
        />
    );

    const authorName = article.author.handle || ens || formatEthereumAddress(article.author.id, 4);

    return (
        <div className="flex items-center gap-2">
            {authorUrl ? (
                <>
                    <Link href={authorUrl} className="z-[1]">
                        {avatar}
                    </Link>
                    <Link
                        href={authorUrl}
                        onClick={stopPropagation}
                        className="block truncate text-clip text-medium leading-5 text-secondary"
                    >
                        {authorName}
                    </Link>
                </>
            ) : (
                <>
                    {avatar}
                    <span className="block truncate text-clip text-medium leading-5 text-secondary">{authorName}</span>
                </>
            )}
            <Time
                dateTime={article.timestamp}
                className="whitespace-nowrap text-medium text-xs leading-4 text-secondary"
            >
                <TimestampFormatter time={article.timestamp} />
            </Time>
            {Icon ? <Icon width={15} height={15} /> : null}
        </div>
    );
}
