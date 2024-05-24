import { Trans } from '@lingui/macro';
import { TextOverflowTooltip } from '@masknet/theme';
import { EVMExplorerResolver } from '@masknet/web3-providers';
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm';
import type { ReactNode } from 'react';
import urlcat from 'urlcat';

import DownloadIcon from '@/assets/download.svg';
import LinkIcon from '@/assets/link-square.svg';
import { Image } from '@/components/Image.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { Link } from '@/esm/Link.js';

export interface NFTInfoProps {
    ownerAddress?: string;
    contractAddress?: string;
    imageURL: string;
    name: string;
    tokenId: string;
    collection?: {
        name: string;
        icon?: string;
    };
    floorPrice?: ReactNode;
    chainId?: ChainId;
}

export function NFTInfo(props: NFTInfoProps) {
    const { imageURL, name, tokenId, collection, ownerAddress, chainId, contractAddress, floorPrice } = props;
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-5">
            <div className="relative mx-auto flex h-[250px] w-[250px] items-center justify-center sm:min-w-[250px]">
                {chainId ? (
                    <div className="absolute left-3 top-3">
                        <ChainIcon chainId={chainId} size={24} />
                    </div>
                ) : null}
                <Image
                    width={250}
                    height={250}
                    src={imageURL}
                    alt={name}
                    className="shadow-lightS3 h-full w-full max-w-[250px] rounded-[20px] object-cover"
                />
            </div>
            <div className="flex w-full flex-1 flex-col sm:w-[calc(100%-20px-250px)]">
                <div className="w-full space-y-3">
                    <div className="flex w-full flex-col items-center justify-center space-y-3 sm:justify-start">
                        {collection ? (
                            <Link
                                href={urlcat(`/nft/${contractAddress}`, {
                                    chainId,
                                })}
                                className="flex h-5 w-full items-center text-base font-bold leading-6"
                            >
                                {collection.icon ? (
                                    <Image
                                        width={20}
                                        height={20}
                                        alt={collection.name}
                                        className="mr-1 h-5 w-5 rounded-md shadow"
                                        src={collection.icon}
                                    />
                                ) : null}
                                <TextOverflowTooltip title={collection.name}>
                                    <div className="max-w-[calc(100%-20px-16px-8px-8px)] truncate">
                                        {collection.name}
                                    </div>
                                </TextOverflowTooltip>
                                <LinkIcon className="min-w-4 ml-1 h-4 w-4 text-secondary" />
                            </Link>
                        ) : null}
                        <TextOverflowTooltip title={name}>
                            <div className="mt-2 line-clamp-2 w-full text-center text-lg font-bold leading-6 sm:text-left">
                                {name}
                            </div>
                        </TextOverflowTooltip>
                    </div>
                    {ownerAddress ? (
                        <div className="space-y-1">
                            <div className="text-base font-normal leading-6 text-secondary">
                                <Trans>Owned By</Trans>
                            </div>
                            {chainId ? (
                                <Link
                                    href={{
                                        href: EVMExplorerResolver.addressLink(chainId, ownerAddress),
                                    }}
                                    className="flex items-center text-base font-bold leading-[14px]"
                                >
                                    {formatEthereumAddress(ownerAddress, 4)}
                                    <LinkIcon className="ml-1 h-4 w-4 text-secondary" />
                                </Link>
                            ) : (
                                <div className="text-base font-bold leading-[14px]">
                                    {formatEthereumAddress(ownerAddress, 4)}
                                </div>
                            )}
                        </div>
                    ) : null}
                    {floorPrice ? (
                        <div className="space-y-1">
                            <div className="text-base font-normal leading-6 text-secondary">
                                <Trans>Floor Price</Trans>
                            </div>
                            <div className="text-base font-bold leading-[14px]">{floorPrice}</div>
                        </div>
                    ) : null}
                    <div className="flex space-x-2">
                        <a
                            className="flex cursor-pointer select-none items-center gap-1 rounded-full border border-line bg-lightBg px-2 py-1 text-[10px] leading-[14px]"
                            href={imageURL}
                            target="_blank"
                            download={imageURL}
                        >
                            <DownloadIcon className="h-3 w-3" />
                            <Trans>Download Image</Trans>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
