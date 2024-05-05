import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { memo } from 'react';

import { Avatar } from '@/components/Avatar.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { classNames } from '@/helpers/classNames.js';
import type { Article } from '@/providers/types/SocialMedia.js';

interface ArticleHeaderProps {
    article: Article;
    className?: string;
}

export const ArticleHeader = memo<ArticleHeaderProps>(function ArticleHeader({ article, className }) {
    return (
        <div className={classNames('flex items-start gap-3', className)}>
            <Avatar className="h-10 w-10" src={article.author.avatar} size={40} alt={article.author.handle} />

            <div className="flex max-w-[calc(100%-40px-88px-24px)] flex-1 items-center gap-2 overflow-hidden">
                <div className="block truncate text-clip text-[15px] font-bold leading-5 text-main">
                    {article.author.handle}
                </div>
                <div className="truncate text-clip text-[15px] leading-6 text-secondary">
                    {formatEthereumAddress(article.author.id, 4)}
                </div>
            </div>
            <div className="ml-auto flex items-center space-x-2 self-baseline">
                <span className="whitespace-nowrap text-xs leading-4 text-secondary md:text-[13px]">
                    <TimestampFormatter time={article.timestamp} />
                </span>
                {/* TODO: report and mute */}
            </div>
        </div>
    );
});
