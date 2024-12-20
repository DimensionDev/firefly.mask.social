'use client';

import { t, Trans } from '@lingui/macro';
import type { NonFungibleTokenTrait } from '@masknet/web3-shared-base';
import { ChainId } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { type ReactNode, useMemo } from 'react';
import type { Hex } from 'viem';
import { useEnsName } from 'wagmi';

import CalendarIcon from '@/assets/calendar.svg';
import LocationIcon from '@/assets/location.svg';
import PoapIcon from '@/assets/poap.svg';
import WebsiteIcon from '@/assets/website-circle.svg';
import { NFTDetailsMore } from '@/components/Actions/NFTDetailsMore.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Image } from '@/components/Image.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { NFTInfoPreview } from '@/components/NFTDetail/NFTInfoPreview.js';
import { PoapTrait } from '@/components/NFTDetail/PoapTrait.js';
import { BookmarkInIcon } from '@/components/NFTs/BookmarkButton.js';
import { TextOverflowTooltip } from '@/components/TextOverflowTooltip.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import { resolveNFTId } from '@/helpers/resolveNFTIdFromAsset.js';
import { resolveNftUrl, resolveNftUrlByCollection } from '@/helpers/resolveNftUrl.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSimpleHashChain } from '@/helpers/resolveSimpleHashChain.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { SimpleHash } from '@/providers/simplehash/type.js';

interface NFTInfoProps {
    ownerAddress?: string;
    contractAddress?: string;
    imageURL: string;
    name: string;
    tokenId: string;
    collection?: {
        name: string;
        icon?: string;
        id?: string;
    };
    floorPrice?: ReactNode;
    chainId: ChainId;
    attendance?: number;
    isPoap?: boolean;
    video?: {
        properties: SimpleHash.VideoProperties;
        url: string;
    };
    link?: string;
    traits: NonFungibleTokenTrait[];
}

function findTraitValue(traits: NonFungibleTokenTrait[], type: string) {
    return traits.find((trait) => trait.type === type)?.value;
}

export function NFTInfo(props: NFTInfoProps) {
    const {
        imageURL,
        name,
        tokenId,
        collection,
        ownerAddress,
        chainId,
        contractAddress,
        floorPrice,
        attendance,
        isPoap = false,
        video,
        link,
        traits,
    } = props;
    const isMedium = useIsMedium();
    const { data: ensName } = useEnsName({
        chainId: ChainId.Mainnet,
        address: ownerAddress as Hex,
    });

    const { data } = useQuery({
        queryKey: ['followings', contractAddress, tokenId],
        enabled: !!contractAddress,
        queryFn: async () => {
            if (!contractAddress) return;
            return FireflyEndpointProvider.getFollowingCountByNFT({
                collectionAddress: contractAddress,
                chainName: resolveSimpleHashChain(chainId),
            });
        },
    });

    const collectionUrl = useMemo(() => {
        return collection?.id
            ? resolveNftUrlByCollection(collection.id)
            : contractAddress
              ? resolveNftUrl(chainId, contractAddress)
              : '';
    }, [collection?.id, contractAddress, chainId]);

    const poapTraits = useMemo(() => {
        const startDate = findTraitValue(traits, 'startDate');
        const endDate = findTraitValue(traits, 'endDate');
        const eventURL = findTraitValue(traits, 'eventURL');
        const location = findTraitValue(traits, 'location');
        const s = startDate ? dayjs(startDate).format('MMM D, YYYY') : '';
        const e = endDate ? dayjs(endDate).format('MMM D, YYYY') : '';

        return {
            date: s && e ? `${s} - ${e}` : s || e,
            eventURL: parseUrl(eventURL || '') || undefined,
            location,
        };
    }, [traits]);

    const action = isPoap ? null : (
        <div className="flex w-full gap-3">
            <ClickableButton className="h-8 flex-1 rounded-full bg-main text-center text-sm font-bold leading-8 text-lightBottom">
                <Trans>Mint</Trans>
            </ClickableButton>
            {link ? (
                <Link
                    href={link}
                    target="_blank"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-main"
                >
                    <WebsiteIcon width={20} height={20} className="text-main" />
                </Link>
            ) : null}
        </div>
    );

    return (
        <div className="flex flex-col gap-2 md:flex-row md:gap-3">
            <div className="relative mx-auto flex h-[230px] w-[230px] items-center justify-center md:min-w-[230px]">
                {isPoap || chainId ? (
                    <div className="absolute left-2.5 top-2.5 z-10 rounded-xl bg-black/25 p-1">
                        {isPoap ? (
                            <PoapIcon width={24} height={24} />
                        ) : (
                            <ChainIcon className="rounded-full" chainId={chainId} size={24} />
                        )}
                    </div>
                ) : null}
                {contractAddress ? (
                    <BookmarkInIcon
                        className="absolute right-2.5 top-2.5 z-10"
                        nftId={resolveNFTId(chainId, contractAddress, tokenId)}
                        ownerAddress={ownerAddress}
                    />
                ) : null}
                {data?.count ? (
                    <div className="absolute bottom-2.5 left-1/2 z-10 inline-block max-w-[90%] -translate-x-1/2 truncate rounded-md bg-black/25 px-2 py-1.5 text-center text-[13px] font-bold text-lightBottom">
                        <Trans>{nFormatter(data.count)} followings owned</Trans>
                    </div>
                ) : null}
                <NFTInfoPreview name={name} imageURL={imageURL} video={video} />
            </div>
            <div className="flex w-full flex-1 flex-col md:w-[calc(100%-20px-230px)]">
                <div className={classNames('flex h-full w-full flex-col', !isMedium ? 'gap-2' : 'justify-between')}>
                    {!isPoap && collection ? (
                        <div className="flex h-5 w-full items-center justify-between text-base font-bold leading-6">
                            <Link className="flex min-w-0 flex-1 items-center" href={collectionUrl}>
                                {collection.icon ? (
                                    <Image
                                        width={20}
                                        height={20}
                                        alt={collection.name}
                                        className="mr-1 h-5 w-5 rounded-md shadow"
                                        src={collection.icon}
                                    />
                                ) : null}
                                <TextOverflowTooltip content={collection.name}>
                                    <div className="max-w-[calc(100%-20px-16px-8px-8px)] truncate">
                                        {collection.name || t`Unknown Collection`}
                                    </div>
                                </TextOverflowTooltip>
                            </Link>
                            <NFTDetailsMore
                                collectionId={collection.id}
                                collectionUrl={collectionUrl}
                                nftImage={imageURL}
                            />
                        </div>
                    ) : null}
                    <div className="flex w-full justify-between">
                        <TextOverflowTooltip content={name}>
                            <div
                                className={classNames(
                                    'w-full text-left text-xl font-bold leading-6',
                                    isPoap ? 'line-clamp-3' : 'line-clamp-2',
                                )}
                            >
                                {name}
                            </div>
                        </TextOverflowTooltip>
                        {isPoap && collection ? (
                            <NFTDetailsMore
                                collectionId={collection.id}
                                collectionUrl={collectionUrl}
                                nftImage={imageURL}
                            />
                        ) : null}
                    </div>
                    {isPoap ? (
                        <ul className="w-full space-y-1 text-medium text-lightSecond">
                            <PoapTrait value={poapTraits.location} icon={LocationIcon} />
                            <PoapTrait value={poapTraits.date} icon={CalendarIcon} />
                            <PoapTrait url={poapTraits.eventURL} icon={WebsiteIcon} />
                        </ul>
                    ) : null}
                    <div className="flex w-full gap-2">
                        {ownerAddress ? (
                            <Link
                                href={resolveProfileUrl(Source.Wallet, ownerAddress)}
                                target="_blank"
                                className="h-[68px] flex-1 space-y-1.5 rounded-lg bg-lightBg p-2.5 text-base"
                            >
                                <span className="leading-4 text-lightSecond">
                                    {isPoap ? <Trans>Collected by</Trans> : <Trans>Owned By</Trans>}
                                </span>
                                <span className="block truncate font-bold text-main">
                                    {ensName ? ensName : formatAddress(ownerAddress, 4)}
                                </span>
                            </Link>
                        ) : null}
                        {floorPrice && !isPoap ? (
                            <div className="h-[68px] flex-1 space-y-1.5 rounded-lg bg-lightBg p-2.5 text-base">
                                <span className="leading-4 text-lightSecond">
                                    <Trans>Floor Price</Trans>
                                </span>
                                <span className="block truncate font-bold text-main">{floorPrice}</span>
                            </div>
                        ) : null}
                        {isPoap && attendance ? (
                            <div className="h-[68px] flex-1 space-y-1.5 rounded-lg bg-lightBg p-2.5 text-base">
                                <span className="leading-4 text-lightSecond">
                                    <Trans>Attendance</Trans>
                                </span>
                                <span className="block truncate font-bold text-main">
                                    {attendance.toLocaleString()}
                                </span>
                            </div>
                        ) : null}
                    </div>
                    {action}
                </div>
            </div>
        </div>
    );
}
