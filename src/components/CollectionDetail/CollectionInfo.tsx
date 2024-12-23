'use client';

import { Trans } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';

import LinkIcon from '@/assets/link-square.svg';
import { CollectionMore } from '@/components/Actions/CollectionMore.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CopyTextButton } from '@/components/CopyTextButton.js';
import { Image } from '@/components/Image.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { NFTImage } from '@/components/NFTImage.js';
import { TextOverflowTooltip } from '@/components/TextOverflowTooltip.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { resolveAddressLink } from '@/helpers/resolveExplorer.js';

interface CollectionInfoProps {
    address: string;
    floorPrice?: string;
    nftCount?: number;
    ownerCount?: number;
    volume24h?: string;
    bannerImageUrl?: string;
    imageUrl: string;
    name: string;
    chainId?: ChainId;
    collectionId?: string;
    externalUrl?: string;
}

export function CollectionInfo(props: CollectionInfoProps) {
    const {
        address,
        name,
        bannerImageUrl,
        imageUrl,
        nftCount,
        ownerCount,
        volume24h,
        floorPrice,
        chainId = ChainId.Mainnet,
        collectionId,
        externalUrl,
    } = props;
    return (
        <div className="w-full">
            <Image
                width={1000}
                height={1000}
                src={bannerImageUrl || '/image/nft-collection-fallback.webp'}
                alt={name}
                className="h-[150px] w-full object-cover"
            />
            <div className="flex w-full p-3">
                <NFTImage
                    width={115}
                    height={115}
                    className="h-[115px] w-[115px] rounded-lg object-cover"
                    src={imageUrl}
                    alt={name}
                />
                <div className="ml-2.5 flex h-[115px] min-w-0 flex-1 flex-col justify-between">
                    <div className="flex w-full gap-2 text-xl font-bold leading-6">
                        <TextOverflowTooltip content={name}>
                            <div className="line-clamp-2 w-full">{name}</div>
                        </TextOverflowTooltip>
                        <ClickableButton className="-mt-1 h-8 rounded-full bg-main px-5 text-sm font-bold leading-8 text-lightBottom">
                            <Trans>Mint</Trans>
                        </ClickableButton>
                        <CollectionMore collectionId={collectionId} externalUrl={externalUrl} />
                    </div>
                    {address ? (
                        <div className="text-normal flex items-center text-base leading-[14px] text-secondary">
                            <ChainIcon className="mr-1 shrink-0" chainId={chainId} size={14} />
                            <span className="hidden min-w-0 truncate sm:inline">{address}</span>
                            <span className="inline sm:hidden">{formatAddress(address, 4)}</span>
                            <CopyTextButton text={address} />
                            <a className="ml-1 h-3 w-3" href={resolveAddressLink(chainId, address)} target="_blank">
                                <LinkIcon className="h-3 w-3 text-secondary" />
                            </a>
                        </div>
                    ) : null}
                    <div className="flex items-center space-x-2 whitespace-nowrap text-sm leading-[22px]">
                        {nftCount ? (
                            <div>
                                <div className="font-bold">{nFormatter(nftCount)}</div>
                                <div className="text-secondary">
                                    <Trans>Items</Trans>
                                </div>
                            </div>
                        ) : null}
                        {ownerCount ? (
                            <>
                                <div className="mx-2 w-3 text-secondary">·</div>
                                <div>
                                    <div className="font-bold">{nFormatter(ownerCount)}</div>
                                    <div className="text-secondary">
                                        <Trans>Owners</Trans>
                                    </div>
                                </div>
                            </>
                        ) : null}
                        {volume24h ? (
                            <>
                                <div className="mx-2 w-3 text-secondary">·</div>
                                <div>
                                    <div className="font-bold">{volume24h}</div>
                                    <div className="text-secondary">
                                        <Trans>24H Volume</Trans>
                                    </div>
                                </div>
                            </>
                        ) : null}
                        {floorPrice ? (
                            <>
                                <div className="mx-2 w-3 text-secondary">·</div>
                                <div>
                                    <div className="font-bold">{floorPrice}</div>
                                    <div className="text-secondary">
                                        <Trans>Floor Price</Trans>
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
