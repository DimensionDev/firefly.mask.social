'use client';

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
    collectionId: string;
}

export function CollectionTabs({ address, chainId, totalQuantity, collectionId }: CollectionTabsProps) {
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
                        items: (
                            <NFTList
                                collectionId={collectionId}
                                address={address}
                                chainId={chainId}
                                NoResultsFallbackProps={{
                                    className: 'md:pt-[228px] max-md:py-20',
                                }}
                            />
                        ),
                        topCollectors: (
                            <TopCollectors
                                collectionId={collectionId}
                                address={address}
                                totalQuantity={totalQuantity}
                                chainId={chainId}
                            />
                        ),
                    }[currentTab]
                }
            </Suspense>
        </div>
    );
}
