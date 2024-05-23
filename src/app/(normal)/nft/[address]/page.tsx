'use client';

import { t } from '@lingui/macro';
import { formatAmount } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';
import { first } from 'lodash-es';
import { notFound } from 'next/navigation.js';
import { useMemo, useState } from 'react';

import ComeBack from '@/assets/comeback.svg';
import { CollectionInfo } from '@/components/CollectionDetail/CollectionInfo.js';
import { NFTList } from '@/components/CollectionDetail/NFTList.js';
import { TopCollectors } from '@/components/CollectionDetail/TopCollectors.js';
import { Loading } from '@/components/Loading.js';
import { Tab, Tabs } from '@/components/Tabs/index.js';
import type { SourceInURL } from '@/constants/enum.js';
import { useComeBack } from '@/hooks/useComeback.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';

export default function Page({ params }: { params: { address: string }; searchParams: { source: SourceInURL } }) {
    const tabs = useMemo(
        () =>
            [
                {
                    label: t`Items`,
                    value: 'items',
                },
                {
                    label: t`Top Collectors`,
                    value: 'topCollectors',
                },
            ] as const,
        [],
    );
    const comeback = useComeBack();
    const [currentTab, setCurrentTab] = useState<(typeof tabs)[number]['value']>('items');
    const { address } = params;
    const { data, isLoading, error } = useQuery({
        queryKey: ['collection-info', address],
        queryFn() {
            return SimpleHashWalletProfileProvider.getCollection(address);
        },
    });

    const floorPrice = useMemo(() => {
        const firstFloorPrice = first(data?.floor_prices);
        if (!firstFloorPrice) return;
        return `${formatAmount(firstFloorPrice.value, -firstFloorPrice.payment_token.decimals)} ${
            firstFloorPrice.payment_token.symbol
        }`;
    }, [data?.floor_prices]);

    if (isLoading) {
        return <Loading />;
    }

    if (error || !data) {
        notFound();
    }

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-40 flex items-center border-b border-line bg-primaryBottom px-4 py-[18px]">
                <ComeBack width={24} height={24} className="mr-8 cursor-pointer" onClick={comeback} />
                <h2 className="text-xl font-black leading-6">{data?.name}</h2>
            </div>
            {data ? (
                <CollectionInfo
                    address={params.address}
                    name={data.name}
                    bannerImageUrl={data.banner_image_url}
                    imageUrl={data.image_url}
                    nftCount={data.distinct_nft_count}
                    ownerCount={data.distinct_owner_count}
                    floorPrice={floorPrice}
                />
            ) : null}
            <div className="px-3 pb-3">
                <Tabs value={currentTab} onChange={setCurrentTab}>
                    {tabs.map((tab) => (
                        <Tab value={tab.value} key={tab.value}>
                            {tab.label}
                        </Tab>
                    ))}
                </Tabs>
                {
                    {
                        items: <NFTList address={address} />,
                        topCollectors: <TopCollectors address={address} totalQuantity={data?.total_quantity} />,
                    }[currentTab]
                }
            </div>
        </div>
    );
}
