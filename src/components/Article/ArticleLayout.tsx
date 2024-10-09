'use client';

import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation.js';
import { memo } from 'react';
import urlcat from 'urlcat';
import { useEnsName } from 'wagmi';

import CollectIcon from '@/assets/collect.svg';
import { ArticleCollect } from '@/components/Article/ArticleCollect.js';
import { ArticleShare } from '@/components/Article/ArticleShare.js';
import { Avatar } from '@/components/Avatar.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { ArticleMarkup } from '@/components/Markup/ArticleMarkup.js';
import { ImageAsset } from '@/components/Posts/ImageAsset.js';
import { Time } from '@/components/Semantic/Time.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { Tips } from '@/components/Tips/index.js';
import { Tooltip } from '@/components/Tooltip.js';
import { IS_APPLE, IS_SAFARI } from '@/constants/bowser.js';
import { Source, SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { getArticleUrl } from '@/helpers/getArticleUrl.js';
import { resolveArticlePlatformIcon } from '@/helpers/resolveArticlePlatformIcon.js';
import { resolveSearchUrl } from '@/helpers/resolveSearchUrl.js';
import { useFireflyIdentity } from '@/hooks/useFireflyIdentity.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { CollectArticleModalRef, DraggablePopoverRef, PreviewMediaModalRef } from '@/modals/controls.js';
import { type Article, ArticlePlatform } from '@/providers/types/Article.js';
import type { ResponseJSON } from '@/types/index.js';
import { type LinkDigested, PayloadType } from '@/types/og.js';

interface ArticleLayoutProps {
    article: Article;
    isInCompose?: boolean;
}

export const ArticleLayout = memo<ArticleLayoutProps>(function ArticleLayout({ article, isInCompose = false }) {
    const router = useRouter();
    const authorUrl = urlcat('/profile/:address', {
        address: article.author.id,
        source: SourceInURL.Wallet,
    });

    const { data: ens } = useEnsName({ address: article.author.id, query: { enabled: !article.author.handle } });
    const identity = useFireflyIdentity(Source.Wallet, article.author.id);
    const Icon = resolveArticlePlatformIcon(article.platform);
    const isMuted = article.author.isMuted;
    const isMedium = useIsMedium();

    const { data: cover } = useQuery({
        queryKey: ['article', 'cover', article.id],
        queryFn: async () => {
            if (article.coverUrl) return article.coverUrl;
            if (article.platform === ArticlePlatform.Mirror && article.origin) {
                const payload = await fetchJSON<ResponseJSON<LinkDigested>>(
                    urlcat('/api/oembed', {
                        link: article.origin,
                    }),
                );
                if (payload.success && payload.data.payload?.type === PayloadType.Mirror) {
                    return payload.data.payload.cover;
                }
            }
            return null;
        },
    });

    return (
        <ClickableArea
            as="article"
            className="relative mt-[6px] flex flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-bg p-3"
            onClick={() => {
                if (isMuted) return;
                const selection = window.getSelection();
                if (selection && selection.toString().length !== 0) return;

                if (isInCompose) return;

                router.push(getArticleUrl(article));
                return;
            }}
        >
            {cover ? (
                <ImageAsset
                    disableLoadHandler
                    src={cover}
                    width={510}
                    height={260}
                    className="mb-3 w-full cursor-pointer rounded-lg object-cover"
                    alt={cover}
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();

                        if (cover)
                            PreviewMediaModalRef.open({
                                medias: [{ type: 'Image', uri: cover }],
                                index: 0,
                                source: Source.Article,
                            });
                    }}
                />
            ) : null}

            <div
                className={classNames('line-clamp-2 text-left text-[18px] font-bold leading-[20px]', {
                    'max-h-[40px]': IS_SAFARI && IS_APPLE,
                })}
            >
                {article.title}
            </div>
            <div className="flex items-center">
                {article.slug ? (
                    <div
                        className="cursor-pointer rounded-lg bg-primaryBottom px-1 py-2 text-xs text-second hover:underline"
                        onClick={(event) => {
                            event.stopPropagation();
                            event.preventDefault();

                            scrollTo(0, 0);
                            router.push(resolveSearchUrl(article.slug || '', undefined, Source.Article));
                        }}
                    >
                        #{article.slug}
                    </div>
                ) : null}
            </div>
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
                <div className="flex items-center">
                    {!(article.platform === ArticlePlatform.Paragraph && !article.origin) &&
                    article.platform !== ArticlePlatform.Limo ? (
                        <Tooltip content={t`Collect`} placement="top">
                            <motion.button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    event.preventDefault();
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
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-lightSecond hover:bg-secondarySuccess/[.20]"
                                whileTap={{ scale: 0.9 }}
                            >
                                <CollectIcon width={17} height={16} />
                            </motion.button>
                        </Tooltip>
                    ) : null}
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
        </ClickableArea>
    );
});
