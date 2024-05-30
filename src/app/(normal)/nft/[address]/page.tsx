'use client';

import { t } from '@lingui/macro';
import { TextOverflowTooltip } from '@masknet/theme';
import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';
import { useState } from 'react';

import ComeBack from '@/assets/comeback.svg';
import { CollectionInfo } from '@/components/CollectionDetail/CollectionInfo.js';
import { NFTList } from '@/components/CollectionDetail/NFTList.js';
import { TopCollectors } from '@/components/CollectionDetail/TopCollectors.js';
import { Loading } from '@/components/Loading.js';
import { Tab, Tabs } from '@/components/Tabs/index.js';
import type { SourceInURL } from '@/constants/enum.js';
import { getFloorPrice } from '@/helpers/getFloorPrice.js';
import { useComeBack } from '@/hooks/useComeback.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';

export default function Page({
    params,
    searchParams,
}: {
    params: { address: string };
    searchParams: { source: SourceInURL; chainId: string };
}) {
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
    const chainId = searchParams.chainId ? Number.parseInt(searchParams.chainId as string, 10) : undefined;
    const comeback = useComeBack();
    const [currentTab, setCurrentTab] = useState<(typeof tabs)[number]['value']>('items');
    const { address } = params;
    const { data, isLoading, error } = useQuery({
        queryKey: ['collection-info', address, chainId],
        queryFn() {
            return SimpleHashWalletProfileProvider.getCollection(address, { chainId });
        },
    });

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
                <TextOverflowTooltip title={data?.name}>
                    <h2 className="max-w-[calc(100%-24px-32px)] truncate text-xl font-black leading-6">{data?.name}</h2>
                </TextOverflowTooltip>
            </div>
            {data ? (
                <CollectionInfo
                    address={params.address}
                    name={data.name}
                    bannerImageUrl={data.banner_image_url}
                    imageUrl={data.image_url}
                    nftCount={data.distinct_nft_count}
                    ownerCount={data.distinct_owner_count}
                    floorPrice={getFloorPrice(data?.floor_prices)}
                    chainId={chainId}
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
                        items: <NFTList address={address} chainId={chainId} />,
                        topCollectors: (
                            <TopCollectors address={address} totalQuantity={data?.total_quantity} chainId={chainId} />
                        ),
                    }[currentTab]
                }
            </div>
        </div>
    );
}
