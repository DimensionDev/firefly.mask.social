import { Trans } from '@lingui/macro';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import type { ReactNode } from 'react';

import DownloadIcon from '@/assets/download.svg';
import LinkIcon from '@/assets/link.svg';
import { Image } from '@/components/Image.js';
import { CopyButton } from '@/components/NFTDetail/CopyButton.js';
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
    lastSale?: ReactNode;
}

export function NFTInfo(props: NFTInfoProps) {
    const { imageURL, name, tokenId, collection, ownerAddress, contractAddress, floorPrice, lastSale } = props;
    return (
        <div className="flex flex-col gap-5 sm:flex-row">
            <div className="w-full sm:w-[300px]">
                <Image width={300} height={300} src={imageURL} alt={name} className="rounded-[20px] object-cover" />
                <div className="mt-4 flex justify-center gap-2">
                    <a
                        className="flex cursor-pointer select-none items-center gap-1 rounded-full border border-line bg-lightBg px-2 py-1 text-[10px] leading-[14px]"
                        href={imageURL}
                        target="_blank"
                        download={imageURL}
                    >
                        <DownloadIcon className="h-3 w-3" />
                        <Trans>Download Image</Trans>
                    </a>

                    {contractAddress ? <CopyButton value={contractAddress} /> : null}
                </div>
            </div>
            <div className="flex flex-1 flex-col sm:pb-10">
                <div className="mb-6 space-y-4">
                    <div className="space-y-2">
                        {collection ? (
                            <Link
                                href={`/nft/${contractAddress}`}
                                className="flex h-6 items-center text-lg font-bold leading-6"
                            >
                                {collection.icon ? (
                                    <Image
                                        width={20}
                                        height={20}
                                        alt={collection.name}
                                        className="mr-2 rounded-md shadow"
                                        src={collection.icon}
                                    />
                                ) : null}
                                {collection.name}
                                <LinkIcon className="ml-1 h-6 w-6 text-secondary" />
                            </Link>
                        ) : null}
                        <div className="mt-2 text-2xl font-medium leading-[30px]">{name}</div>
                    </div>
                    {ownerAddress ? (
                        <div className="space-y-1.5">
                            <div className="text-base font-medium leading-[22px] text-secondary">
                                <Trans>Owned By</Trans>
                            </div>
                            <div className="text-lg font-bold">{formatEthereumAddress(ownerAddress, 4)}</div>
                        </div>
                    ) : null}
                </div>
                <div className="mt-auto flex justify-between">
                    {floorPrice ? (
                        <div className="space-y-1.5">
                            <div className="text-base font-medium leading-[22px] text-secondary">
                                <Trans>Floor Price</Trans>
                            </div>
                            <div className="text-lg font-bold leading-6">{floorPrice}</div>
                        </div>
                    ) : null}
                    {lastSale && floorPrice ? <div className="mx-2 h-[54px] w-[1px] bg-line" /> : null}
                    {lastSale ? (
                        <div className="space-y-1.5">
                            <div className="leading-5.5 text-base font-medium text-secondary">
                                <Trans>Last Sale</Trans>
                            </div>
                            <div className="text-lg font-bold leading-6">{lastSale}</div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
