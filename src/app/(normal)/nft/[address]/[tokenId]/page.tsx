'use client';

import { t } from '@lingui/macro';
import { formatAmount } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';
import { first } from 'lodash-es';
import { notFound } from 'next/navigation.js';
import { useMemo, useState } from 'react';

import ComeBack from '@/assets/comeback.svg';
import { Loading } from '@/components/Loading.js';
import { NFTInfo } from '@/components/NFTDetail/NFTInfo.js';
import { NFTOverflow } from '@/components/NFTDetail/NFTOverflow.js';
import { Tab, Tabs } from '@/components/Tabs/index.js';
import { useComeBack } from '@/hooks/useComeback.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';
import type { SearchParams } from '@/types/index.js';

const tabs = [
    {
        label: t`Overflow`,
        value: 'overflow',
    },
    {
        label: t`Properties`,
        value: 'properties',
    },
] as const;

export default function Page({
    params: { address, tokenId },
    searchParams,
}: {
    params: {
        address: string;
        tokenId: string;
    };
    searchParams: SearchParams;
}) {
    const comeback = useComeBack();
    const [currentTab, setCurrentTab] = useState<(typeof tabs)[number]['value']>('overflow');
    const chainId = searchParams.chainId as string | undefined;

    const { data, isLoading, error } = useQuery({
        queryKey: ['nft', address, tokenId, chainId],
        queryFn() {
            return SimpleHashWalletProfileProvider.getNFT(address, tokenId, {
                chainId: chainId ? parseInt(chainId) : undefined,
            });
        },
    });
    const floorPrice = useMemo(() => {
        const firstFloorPrice = first(data?.collection?.floorPrices);
        if (!firstFloorPrice) return;
        return `${formatAmount(firstFloorPrice.value, -firstFloorPrice.payment_token.decimals)} ${
            firstFloorPrice.payment_token.symbol
        }`;
    }, [data]);

    const tabPanel = useMemo(
        () =>
            ({
                overflow: (
                    <NFTOverflow
                        description={data?.metadata?.description ?? ''}
                        tokenId={data?.tokenId}
                        contractAddress={data?.contract?.address ?? ''}
                        creator={data?.creator?.address}
                        chainId={data?.chainId}
                        schemaType={data?.contract?.schema}
                    />
                ),
                properties: <div>properties</div>,
            })[currentTab],
        [data, currentTab],
    );

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        notFound();
    }

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-40 flex items-center border-b border-line bg-primaryBottom px-4 py-[18px]">
                <ComeBack width={24} height={24} className="mr-8 cursor-pointer" onClick={comeback} />
                <h2 className="text-xl font-black leading-6">{data?.metadata?.name}</h2>
            </div>
            <div className="space-y-6 p-5">
                <NFTInfo
                    imageURL={data?.metadata?.imageURL ?? ''}
                    name={data?.metadata?.name ?? ''}
                    tokenId={data?.metadata?.tokenId ?? ''}
                    ownerAddress={data?.owner?.address}
                    contractAddress={data?.contract?.address ?? ''}
                    collection={{
                        name: data?.contract?.name ?? '',
                        icon: data?.collection?.iconURL ?? undefined,
                    }}
                    floorPrice={floorPrice}
                />
                <Tabs value={currentTab} onChange={setCurrentTab}>
                    {tabs.map((tab) => (
                        <Tab value={tab.value} key={tab.value}>
                            {tab.label}
                        </Tab>
                    ))}
                </Tabs>
                {tabPanel}
            </div>
        </div>
    );
}
