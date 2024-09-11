import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { produce } from 'immer';
import { memo, Suspense } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { Loading } from '@/components/Loading.js';
import { FollowingNFTList } from '@/components/NFTs/FollowingNFTList.js';
import { ArticleList } from '@/components/Profile/ArticleList.js';
import { NFTs } from '@/components/Profile/NFTs.js';
import { POAPList } from '@/components/Profile/POAPList.js';
import { WalletProfileCategory } from '@/constants/enum.js';
import { WALLET_PROFILE_TAB_TYPES } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { isWalletProfileCategory } from '@/helpers/isWalletProfileCategory.js';
import { ProfilePageContext } from '@/hooks/useProfilePageContext.js';

const ContentList = memo(function ContentList({ type, address }: { type: WalletProfileCategory; address: string }) {
    switch (type) {
        case WalletProfileCategory.Articles:
            return <ArticleList address={address} />;
        case WalletProfileCategory.POAPs:
            return <POAPList address={address} />;
        case WalletProfileCategory.NFTs:
            return <NFTs address={address} />;
        case WalletProfileCategory.OnChainActivities:
            return <FollowingNFTList walletAddress={address} />;
        default:
            safeUnreachable(type);
            return null;
    }
});

interface WalletTabsProps {
    address: string;
}

export function WalletTabs({ address }: WalletTabsProps) {
    const { update, category } = ProfilePageContext.useContainer();
    function setWalletProfileCategory(type: WalletProfileCategory) {
        update((x) =>
            produce(x, (ctx) => {
                ctx.category = type;
            }),
        );
    }
    const computedCategory =
        category && isWalletProfileCategory(category) ? category : WalletProfileCategory.OnChainActivities;

    const tabTitles = {
        [WalletProfileCategory.OnChainActivities]: <Trans>Onchain Activities</Trans>,
        [WalletProfileCategory.POAPs]: <Trans>POAPs</Trans>,
        [WalletProfileCategory.NFTs]: <Trans>NFTs</Trans>,
        [WalletProfileCategory.Articles]: <Trans>Articles</Trans>,
    };

    return (
        <>
            <div className="scrollable-tab flex gap-5 border-b border-lightLineSecond px-5 dark:border-line">
                {WALLET_PROFILE_TAB_TYPES.map((type) => ({ type, title: tabTitles[type] })).map(({ type, title }) => (
                    <div key={type} className="flex flex-col">
                        <ClickableButton
                            className={classNames(
                                'flex h-[46px] items-center px-[14px] font-extrabold transition-all',
                                computedCategory === type ? 'text-main' : 'text-third hover:text-main',
                            )}
                            onClick={() => setWalletProfileCategory(type)}
                        >
                            {title}
                        </ClickableButton>
                        <span
                            className={classNames(
                                'h-1 w-full rounded-full bg-fireflyBrand transition-all',
                                computedCategory !== type ? 'hidden' : '',
                            )}
                        />
                    </div>
                ))}
            </div>

            <Suspense fallback={<Loading />}>
                <ContentList type={computedCategory} address={address} />
            </Suspense>
        </>
    );
}
