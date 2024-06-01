import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { memo, Suspense } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { Loading } from '@/components/Loading.js';
import { ArticleList } from '@/components/Profile/ArticleList.js';
import { NFTs } from '@/components/Profile/NFTs.js';
import { POAPList } from '@/components/Profile/POAPList.js';
import { WalletProfileTabType } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { useStateWithSearchParams } from '@/hooks/useStateWithSearchParams.js';

const ContentList = memo(function ContentList({ type, address }: { type: WalletProfileTabType; address: string }) {
    switch (type) {
        case WalletProfileTabType.Articles:
            return <ArticleList address={address} />;
        case WalletProfileTabType.POAPs:
            return <POAPList address={address} />;
        case WalletProfileTabType.NFTs:
            return <NFTs address={address} />;
        default:
            safeUnreachable(type);
            return null;
    }
});

interface WalletTabsProps {
    address: string;
}

export function WalletTabs({ address }: WalletTabsProps) {
    const [currentTab, setCurrentTab] = useStateWithSearchParams<WalletProfileTabType>(
        'wallet_tab',
        WalletProfileTabType.Articles,
    );

    return (
        <>
            <div className="scrollable-tab flex gap-5 border-b border-lightLineSecond px-5 dark:border-line">
                {[
                    {
                        type: WalletProfileTabType.Articles,
                        title: <Trans>Articles</Trans>,
                    },
                    {
                        type: WalletProfileTabType.POAPs,
                        title: <Trans>POAPs</Trans>,
                    },
                    {
                        type: WalletProfileTabType.NFTs,
                        title: <Trans>NFTs</Trans>,
                    },
                ].map(({ type, title }) => (
                    <div key={type} className="flex flex-col">
                        <ClickableButton
                            className={classNames(
                                'flex h-[46px] items-center px-[14px] font-extrabold transition-all',
                                currentTab === type ? 'text-main' : 'text-third hover:text-main',
                            )}
                            onClick={() => setCurrentTab(type)}
                        >
                            {title}
                        </ClickableButton>
                        <span
                            className={classNames(
                                'h-1 w-full rounded-full bg-[#9250FF] transition-all',
                                currentTab !== type ? 'hidden' : '',
                            )}
                        />
                    </div>
                ))}
            </div>

            <Suspense fallback={<Loading />}>
                <ContentList type={currentTab} address={address} />
            </Suspense>
        </>
    );
}
