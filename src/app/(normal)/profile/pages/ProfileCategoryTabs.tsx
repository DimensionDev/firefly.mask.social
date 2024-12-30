'use client';

import { Trans } from '@lingui/macro';
import { type ReactNode, useMemo } from 'react';

import {
    NetworkType,
    type ProfilePageSource,
    SocialProfileCategory,
    type SocialSource,
    Source,
    WalletProfileCategory,
} from '@/constants/enum.js';
import { SORTED_PROFILE_TAB_TYPE, WALLET_PROFILE_TAB_TYPES } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { getAddressType } from '@/helpers/getAddressType.js';
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
    const tabTitles: Record<WalletProfileCategory, ReactNode> = useMemo(
        () => ({
            [WalletProfileCategory.Activities]: <Trans>Activities</Trans>,
            [WalletProfileCategory.POAPs]: <Trans>POAPs</Trans>,
            [WalletProfileCategory.NFTs]: <Trans>NFTs</Trans>,
            [WalletProfileCategory.Articles]: <Trans>Articles</Trans>,
            [WalletProfileCategory.DAOs]: <Trans>DAOs</Trans>,
            [WalletProfileCategory.Polymarket]: <Trans>Bets</Trans>,
        }),
        [],
    );

    const categories = useMemo(() => {
        if (source === Source.Wallet) {
            const addressType = getAddressType(id);
            const tabs =
                addressType === NetworkType.Solana
                    ? WALLET_PROFILE_TAB_TYPES.solana
                    : WALLET_PROFILE_TAB_TYPES.ethereum;
            return tabs.map((type) => ({ type, title: tabTitles[type] }));
        }

        return [
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
    }, [id, source, tabTitles]);

    return (
        <nav className="scrollable-tab flex gap-1.5 border-b border-lightLineSecond px-3 dark:border-line">
            {categories.map(({ type, title }) => {
                return (
                    <div key={type} className="flex flex-col">
                        <Link
                            href={resolveProfileUrl(source, id, type)}
                            replace
                            className={classNames(
                                'flex h-[45px] items-center whitespace-nowrap px-3 font-extrabold transition-all hover:text-highlight',
                                category === type ? 'text-highlight' : 'text-third',
                            )}
                        >
                            {title}
                        </Link>
                        {category === type ? <span className="h-1 w-full bg-highlight transition-all" /> : null}
                    </div>
                );
            })}
        </nav>
    );
}
