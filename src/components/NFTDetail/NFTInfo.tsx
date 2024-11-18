'use client';

import { Trans } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';
import { type ReactNode, useMemo } from 'react';
import { useEnsName } from 'wagmi';

import LinkIcon from '@/assets/link-square.svg';
import PoapIcon from '@/assets/poap.svg';
import { Image } from '@/components/Image.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { DownloadImageButton } from '@/components/NFTDetail/DownloadImageButton.js';
import { ReportSpamButton } from '@/components/NFTDetail/ReportSpamButton.js';
import { NFTImage } from '@/components/NFTImage.js';
import { TextOverflowTooltip } from '@/components/TextOverflowTooltip.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { resolveNftUrl, resolveNftUrlByCollection } from '@/helpers/resolveNftUrl.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';

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
    tokenNameClassName?: string;
    isPoap?: boolean;
}

export function NFTInfo(props: NFTInfoProps) {
    const {
        imageURL,
        name,
        collection,
        ownerAddress,
        chainId,
        contractAddress,
        floorPrice,
        attendance,
        tokenNameClassName,
        isPoap = false,
    } = props;
    const { data: ensName } = useEnsName({
        chainId: ChainId.Mainnet,
        address: props.ownerAddress as `0x${string}`,
    });

    const collectionUrl = useMemo(() => {
        return collection?.id
            ? resolveNftUrlByCollection(collection.id)
            : contractAddress
              ? resolveNftUrl(chainId, contractAddress)
              : '';
    }, [collection?.id, contractAddress, chainId]);

    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-5">
            <div className="relative mx-auto flex h-[250px] w-[250px] items-center justify-center sm:min-w-[250px]">
                {chainId && !isPoap ? (
                    <div className="absolute left-3 top-3">
                        <ChainIcon chainId={chainId} size={24} />
                    </div>
                ) : null}
                {isPoap ? <PoapIcon className="absolute left-3 top-3 h-6 w-6" /> : null}
                <NFTImage
                    width={250}
                    height={250}
                    src={imageURL}
                    alt={name}
                    className="h-full w-full max-w-[250px] rounded-[20px] object-cover shadow-lightS3"
                />
            </div>
            <div className="flex w-full flex-1 flex-col sm:w-[calc(100%-20px-250px)]">
                <div className="w-full space-y-3">
                    <div className="flex w-full flex-col items-center justify-center space-y-3 sm:justify-start">
                        {!isPoap && collection ? (
                            <Link
                                href={collectionUrl}
                                className="flex h-5 w-full items-center justify-center text-base font-bold leading-6 sm:justify-start"
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
                                <TextOverflowTooltip content={collection.name}>
                                    <div className="max-w-[calc(100%-20px-16px-8px-8px)] truncate">
                                        {collection.name}
                                    </div>
                                </TextOverflowTooltip>
                                <LinkIcon className="ml-1 h-4 w-4 min-w-4 text-secondary" />
                            </Link>
                        ) : null}
                        <TextOverflowTooltip content={name}>
                            <div
                                className={classNames(
                                    'mt-2 line-clamp-2 w-full text-center text-2xl font-bold leading-6 sm:text-left',
                                    tokenNameClassName,
                                )}
                            >
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
                                    href={resolveProfileUrl(Source.Wallet, ownerAddress)}
                                    target="_blank"
                                    className="flex items-center text-base font-bold leading-[14px]"
                                >
                                    {ensName ? ensName : formatAddress(ownerAddress, 4)}
                                    <LinkIcon className="ml-1 h-4 w-4 text-secondary" />
                                </Link>
                            ) : (
                                <div className="text-base font-bold leading-[14px]">
                                    {formatAddress(ownerAddress, 4)}
                                </div>
                            )}
                        </div>
                    ) : null}
                    {attendance ? (
                        <div className="space-y-1">
                            <div className="text-base font-normal leading-6 text-secondary">
                                <Trans>Attendance</Trans>
                            </div>
                            <div className="text-base font-bold leading-[14px]">{attendance.toLocaleString()}</div>
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
                        {imageURL ? <DownloadImageButton url={imageURL} /> : null}
                        {collection?.id ? <ReportSpamButton collectionId={collection.id} /> : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
