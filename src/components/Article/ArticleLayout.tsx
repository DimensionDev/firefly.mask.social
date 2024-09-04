'use client';

import { useRouter } from 'next/navigation.js';
import { memo } from 'react';
import urlcat from 'urlcat';
import { useEnsName } from 'wagmi';

import { Avatar } from '@/components/Avatar.js';
import { ArticleMarkup } from '@/components/Markup/ArticleMarkup.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { IS_APPLE, IS_SAFARI } from '@/constants/bowser.js';
import { PageRoute, SearchType, Source, SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { type Article } from '@/providers/types/Article.js';

interface ArticleLayoutProps {
    article: Article;
}

export const ArticleLayout = memo<ArticleLayoutProps>(function ArticleLayout({ article }) {
    const router = useRouter();
    const authorUrl = urlcat('/profile/:address', {
        address: article.author.id,
        source: SourceInURL.Wallet,
    });

    const { data: ens } = useEnsName({ address: article.author.id, query: { enabled: !article.author.handle } });

    return (
        <div className="relative mt-[6px] flex flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-bg p-3">
            <div
                className={classNames('line-clamp-2 text-base font-bold leading-[20px]', {
                    'max-h-[40px]': IS_SAFARI && IS_APPLE,
                })}
            >
                {article.title}
            </div>
            {article.slug ? (
                <div
                    className="cursor-pointer rounded-lg bg-primaryBottom text-second hover:underline"
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();

                        scrollTo(0, 0);
                        router.push(
                            urlcat(PageRoute.Search, {
                                q: article.slug,
                                type: SearchType.Posts,
                                source: Source.Article,
                            }),
                        );
                    }}
                >
                    #{article.slug}
                </div>
            ) : null}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
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
                        className="block truncate text-clip text-medium font-bold leading-5 text-main"
                    >
                        {article.author.handle || ens}
                    </Link>
                    <span className="whitespace-nowrap text-xs leading-4 text-secondary md:text-[13px]">
                        <TimestampFormatter time={article.timestamp} />
                    </span>
                </div>
            </div>
            {article.content ? (
                <div className="h-[100px]">
                    <ArticleMarkup
                        disableImage
                        className="markup linkify break-words text-sm leading-[18px] text-second"
                    >
                        {article.content}
                    </ArticleMarkup>
                    <div
                        className="absolute bottom-0 left-0 h-[100px] w-full"
                        style={{
                            background: `linear-gradient(
                            to top,
                            rgba(var(--background-end-rgb), 1) 0%,
                            rgba(var(--background-end-rgb), 0.3) 50%,
                            rgba(var(--background-end-rgb), 0.15) 65%,
                            rgba(var(--background-end-rgb), 0.075) 75.5%,
                            rgba(var(--background-end-rgb), 0.037) 82.85%,
                            rgba(var(--background-end-rgb), 0.019) 88%,
                            rgba(var(--background-end-rgb), 0) 100%
                          )`,
                        }}
                    />
                </div>
            ) : null}
        </div>
    );
});
