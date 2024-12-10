'use client';

import { Trans } from '@lingui/macro';
import type { NonFungibleAsset } from '@masknet/web3-shared-base';
import { ChainId, type SchemaType } from '@masknet/web3-shared-evm';
import dayjs from 'dayjs';
import { isUndefined } from 'lodash-es';
import { memo } from 'react';

import CalendarIcon from '@/assets/calendar.svg';
import LocationIcon from '@/assets/location.svg';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { NFTImage } from '@/components/NFTImage.js';
import { BookmarkInIcon } from '@/components/NFTs/BookmarkButton.js';
import { TokenPrice } from '@/components/TokenPrice.js';
import { Link } from '@/esm/Link.js';
import { getFloorPrice } from '@/helpers/getFloorPrice.js';
import { resolveCoinGeckoTokenSymbol } from '@/helpers/resolveCoinGeckoTokenSymbol.js';
import { resolveNFTId } from '@/helpers/resolveNFTIdFromAsset.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { useNFTDetail } from '@/hooks/useNFTDetail.js';
import { NFTFeedTransAction } from '@/providers/types/NFTs.js';

interface Props {
    address: string;
    tokenId: string;
    chainId: ChainId;
    action: NFTFeedTransAction;
    ownerAddress: string;
}

const PoapTags = memo(function PoapTags({ asset }: { asset: NonFungibleAsset<ChainId, SchemaType> }) {
    const startDate = asset.traits?.find((trait) => trait.type === 'startDate');
    const endDate = asset.traits?.find((trait) => trait.type === 'endDate');
    const date =
        startDate && endDate
            ? // cspell: disable-next-line
              `${dayjs(startDate.value).format('MMMDD')}-${dayjs(endDate.value).format('MMMDD')}`
            : null;
    const city = asset.traits?.find((trait) => trait.type === 'city')?.value;

    return (
        <>
            {city ? (
                <div className="flex space-x-1 truncate rounded-lg bg-black/25 p-1.5 text-sm font-bold text-white backdrop-blur-lg">
                    <LocationIcon width={12} height={12} className="shrink-0" />
                    {city}
                </div>
            ) : null}
            {date ? (
                <div className="flex space-x-1 truncate rounded-lg bg-black/25 p-1.5 text-sm font-bold text-white backdrop-blur-lg">
                    <CalendarIcon width={12} height={12} className="shrink-0" />
                    {date}
                </div>
            ) : null}
        </>
    );
});

export function NFTsActivityCellCard(props: Props) {
    const { address, tokenId, chainId, action, ownerAddress } = props;
    const { data, isLoading } = useNFTDetail(address, tokenId, chainId);
    const metadata = data?.metadata;
    const imageURL = metadata?.previewImageURL || metadata?.imageURL || '';
    return (
        <div className="relative">
            <Link href={resolveNftUrl(chainId, address, tokenId)} className="relative flex w-auto shrink-0 flex-col">
                <div className="relative">
                    <NFTImage
                        src={imageURL}
                        className="h-auto max-h-[500px] min-h-[150px] w-[250px] rounded-t-xl bg-lightBg object-cover dark:bg-bg md:w-[300px]"
                        alt="nft-card"
                        fallbackClassName=""
                        width={200}
                        height={200}
                    />
                    <div className="absolute bottom-0 left-0 flex max-w-[100%] flex-col space-y-1 px-[15px] pb-3">
                        {action === NFTFeedTransAction.Poap && !isUndefined(data?.metadata?.eventId) ? (
                            <PoapTags asset={data} />
                        ) : (
                            <div className="truncate rounded-lg bg-black/25 p-1.5 text-sm font-bold text-white backdrop-blur-lg">
                                {data?.metadata?.name || `#${tokenId}`}
                            </div>
                        )}
                    </div>
                </div>
                <div className="absolute left-[14px] top-3 flex size-8 items-center justify-center rounded-xl bg-black/25">
                    <ChainIcon chainId={chainId} size={24} />
                </div>
                <div className="w-full rounded-b-xl bg-lightBg p-3 text-sm font-bold dark:bg-bg">
                    {data?.collection?.floorPrices?.length ? (
                        <>
                            {getFloorPrice(data.collection.floorPrices)}
                            <TokenPrice
                                value={data.collection.floorPrices[0].value}
                                symbol={resolveCoinGeckoTokenSymbol(
                                    data.collection.floorPrices[0].payment_token.symbol,
                                )}
                                prefix=" ($"
                                suffix=")"
                                decimals={data.collection.floorPrices[0].payment_token.decimals}
                                target="usd"
                            />
                        </>
                    ) : (
                        <Trans>Free</Trans>
                    )}
                </div>
            </Link>
            <div className="absolute right-[14px] top-3">
                <BookmarkInIcon nftId={resolveNFTId(chainId, address, tokenId)} ownerAddress={ownerAddress} />
            </div>
        </div>
    );
}
