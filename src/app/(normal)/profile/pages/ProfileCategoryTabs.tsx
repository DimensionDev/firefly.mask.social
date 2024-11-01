'use client';

import { Trans } from '@lingui/macro';
import type { ReactNode } from 'react';

import {
    type ProfilePageSource,
    SocialProfileCategory,
    type SocialSource,
    Source,
    WalletProfileCategory,
} from '@/constants/enum.js';
import { SORTED_PROFILE_TAB_TYPE, WALLET_PROFILE_TAB_TYPES } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';

export function ProfileCategoryTabs({
    source,
    id,
    category,
}: {
    source: ProfilePageSource;
    id: string;
    category: WalletProfileCategory | SocialProfileCategory;
}) {
    const tabTitles: Record<WalletProfileCategory, ReactNode> = {
        [WalletProfileCategory.OnChainActivities]: <Trans>Onchain Activities</Trans>,
        [WalletProfileCategory.POAPs]: <Trans>POAPs</Trans>,
        [WalletProfileCategory.NFTs]: <Trans>NFTs</Trans>,
        [WalletProfileCategory.Articles]: <Trans>Articles</Trans>,
        [WalletProfileCategory.DAO]: <Trans>DAO</Trans>,
    };

    const categories =
        source === Source.Wallet
            ? WALLET_PROFILE_TAB_TYPES.map((type) => ({ type, title: tabTitles[type] }))
            : [
                  {
                      type: SocialProfileCategory.Feed,
                      title: source === Source.Farcaster ? <Trans>Casts</Trans> : <Trans>Feed</Trans>,
                  },
                  {
                      type: SocialProfileCategory.Replies,
                      title: source === Source.Farcaster ? <Trans>Casts + Replies</Trans> : <Trans>Replies</Trans>,
                  },
                  {
                      type: SocialProfileCategory.Likes,
                      title: <Trans>Likes</Trans>,
                  },
                  {
                      type: SocialProfileCategory.Media,
                      title: <Trans>Media</Trans>,
                  },
                  {
                      type: SocialProfileCategory.Collected,
                      title: <Trans>Collected</Trans>,
                  },
                  {
                      type: SocialProfileCategory.Channels,
                      title: <Trans>Channels</Trans>,
                  },
              ].filter((x) => SORTED_PROFILE_TAB_TYPE[source as SocialSource].includes(x.type));

    return (
        <nav className="scrollable-tab flex gap-5 border-b border-lightLineSecond px-5 dark:border-line">
            {categories.map(({ type, title }) => {
                return (
                    <div key={type} className="flex flex-col">
                        <Link
                            href={resolveProfileUrl(source, id, type)}
                            replace
                            className={classNames(
                                'flex h-[46px] items-center whitespace-nowrap px-[14px] font-extrabold transition-all',
                                category === type ? 'text-main' : 'text-third hover:text-main',
                            )}
                        >
                            {title}
                        </Link>
                        <span
                            className={classNames(
                                'h-1 w-full rounded-full bg-fireflyBrand transition-all',
                                category !== type ? 'hidden' : '',
                            )}
                        />
                    </div>
                );
            })}
        </nav>
    );
}
