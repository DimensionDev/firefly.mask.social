'use client';

import { Trans } from '@lingui/macro';
import { useRouter } from 'next/navigation.js';

import { ClickableButton } from '@/components/ClickableButton.js';
import {
    type ProfilePageSource,
    SocialProfileCategory,
    type SocialSource,
    Source,
    WalletProfileCategory,
} from '@/constants/enum.js';
import { SORTED_PROFILE_TAB_TYPE, WALLET_PROFILE_TAB_TYPES } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { ProfilePageContext } from '@/hooks/useProfilePageContext.js';

export function ProfileCategoryTabs({ source }: { source: ProfilePageSource }) {
    const { category, setCategory } = ProfilePageContext.useContainer();
    const tabTitles = {
        [WalletProfileCategory.OnChainActivities]: <Trans>Onchain Activities</Trans>,
        [WalletProfileCategory.POAPs]: <Trans>POAPs</Trans>,
        [WalletProfileCategory.NFTs]: <Trans>NFTs</Trans>,
        [WalletProfileCategory.Articles]: <Trans>Articles</Trans>,
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

    const router = useRouter();

    return (
        <div className="scrollable-tab flex gap-5 border-b border-lightLineSecond px-5 dark:border-line">
            {categories.map(({ type, title }) => {
                return (
                    <div key={type} className="flex flex-col">
                        <ClickableButton
                            className={classNames(
                                'flex h-[46px] items-center whitespace-nowrap px-[14px] font-extrabold transition-all',
                                category === type ? 'text-main' : 'text-third hover:text-main',
                            )}
                            onClick={() => setCategory(type)}
                        >
                            {title}
                        </ClickableButton>
                        <span
                            className={classNames(
                                'h-1 w-full rounded-full bg-fireflyBrand transition-all',
                                category !== type ? 'hidden' : '',
                            )}
                        />
                    </div>
                );
            })}
        </div>
    );
}
