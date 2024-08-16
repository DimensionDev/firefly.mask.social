import { Trans } from '@lingui/macro';
import { EVMExplorerResolver } from '@masknet/web3-providers';
import { ChainId } from '@masknet/web3-shared-evm';

import LinkIcon from '@/assets/link-square.svg';
import { ReportSpamButton } from '@/components/CollectionDetail/ReportSpamButton.js';
import { CopyButton } from '@/components/CopyButton.js';
import { Image } from '@/components/Image.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { NFTImage } from '@/components/NFTImage.js';
import { TextOverflowTooltip } from '@/components/TextOverflowTooltip.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';

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
                    width={90}
                    height={90}
                    className="h-[90px] w-[90px] rounded-lg object-cover"
                    src={imageUrl}
                    alt={name}
                />
                <div className="ml-2.5 w-full max-w-[calc(100%-100px)] flex-1 space-y-1">
                    <div className="flex w-full items-center text-xl font-bold leading-6">
                        <ChainIcon chainId={chainId} size={24} />
                        <TextOverflowTooltip content={name}>
                            <div className="ml-2 w-[calc(100%-32px-32px)] truncate">{name}</div>
                        </TextOverflowTooltip>
                        {collectionId ? <ReportSpamButton collectionId={collectionId} /> : null}
                    </div>
                    <div className="text-normal flex items-center text-sm leading-[14px] text-secondary">
                        <span className="hidden sm:inline">{address}</span>
                        <span className="inline sm:hidden">{formatEthereumAddress(address, 4)}</span>
                        <CopyButton value={address} />
                        <a
                            className="ml-1.5 h-3 w-3"
                            href={EVMExplorerResolver.addressLink(chainId, address)}
                            target="_blank"
                        >
                            <LinkIcon className="h-3 w-3 text-secondary" />
                        </a>
                    </div>
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
