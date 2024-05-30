'use clinet';

import { t } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';
import { Suspense, useState } from 'react';

import { NFTList } from '@/components/CollectionDetail/NFTList.js';
import { TopCollectors } from '@/components/CollectionDetail/TopCollectors.js';
import { Loading } from '@/components/Loading.js';
import { Tab, Tabs } from '@/components/Tabs/index.js';

interface CollectionTabsProps {
    address: string;
    chainId?: ChainId;
    totalQuantity?: number;
}

export function CollectionTabs({ address, chainId, totalQuantity }: CollectionTabsProps) {
    const tabs = [
        {
            label: t`Items`,
            value: 'items',
        },
        {
            label: t`Top Collectors`,
            value: 'topCollectors',
        },
    ] as const;
    const [currentTab, setCurrentTab] = useState<(typeof tabs)[number]['value']>('items');

    return (
        <div className="px-3 pb-3">
            <Tabs value={currentTab} onChange={setCurrentTab} variant="second">
                {tabs.map((tab) => (
                    <Tab value={tab.value} key={tab.value}>
                        {tab.label}
                    </Tab>
                ))}
            </Tabs>
            <Suspense fallback={<Loading />}>
                {
                    {
                        items: <NFTList address={address} chainId={chainId} />,
                        topCollectors: (
                            <TopCollectors address={address} totalQuantity={totalQuantity} chainId={chainId} />
                        ),
                    }[currentTab]
                }
            </Suspense>
        </div>
    );
}
