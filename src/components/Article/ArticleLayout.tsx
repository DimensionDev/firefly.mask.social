'use client';

import DOMPurify from 'dompurify';
import { useRouter } from 'next/navigation.js';
import { memo } from 'react';
import urlcat from 'urlcat';
import { useEnsName } from 'wagmi';

import { ArticleShare } from '@/components/Article/ArticleShare.js';
import { Avatar } from '@/components/Avatar.js';
import { ArticleMarkup } from '@/components/Markup/ArticleMarkup.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { Tips } from '@/components/Tips/index.js';
import { IS_APPLE, IS_SAFARI } from '@/constants/bowser.js';
import { PageRoute, SearchType, Source, SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveArticlePlatformIcon } from '@/helpers/resolveArticlePlatformIcon.js';
import { useFireflyIdentity } from '@/hooks/useFireflyIdentity.js';
import { type Article, ArticlePlatform } from '@/providers/types/Article.js';

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
    const identity = useFireflyIdentity(Source.Wallet, article.author.id);
    const Icon = resolveArticlePlatformIcon(article.platform);

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
            <div className="flex items-center justify-between border-b border-secondaryLine pb-[10px]">
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
                        {article.author.handle || ens}
                    </Link>
                    <span className="whitespace-nowrap text-medium text-xs leading-4 text-secondary">
                        <TimestampFormatter time={article.timestamp} />
                    </span>
                    {Icon ? <Icon width={15} height={15} /> : null}
                </div>
                <div className="flex items-center">
                    <Tips
                        identity={identity}
                        handle={article.author.handle || ens}
                        tooltipDisabled
                        onClick={close}
                        pureWallet
                    />
                    <ArticleShare article={article} />
                </div>
            </div>
            {article.content ? (
                <div className="h-[100px]">
                    {article.platform === ArticlePlatform.Limo ? (
                        // The content returned by limo is html.
                        // eslint-disable-next-line react/no-danger
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }} />
                    ) : (
                        <ArticleMarkup
                            disableImage
                            className="markup linkify break-words text-sm leading-[18px] text-second"
                        >
                            {article.content}
                        </ArticleMarkup>
                    )}
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
