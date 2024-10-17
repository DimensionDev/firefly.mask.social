'use client';

import { t, Trans } from '@lingui/macro';
import { EVMExplorerResolver } from '@masknet/web3-providers';
import { SchemaType } from '@masknet/web3-shared-evm';
import { type ReactNode, useMemo } from 'react';

import LinkIcon from '@/assets/link-square.svg';
import { CopyTextButton } from '@/components/CopyTextButton.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { Link } from '@/esm/Link.js';
import { resolveSimpleHashChain } from '@/helpers/resolveSimpleHashChain.js';
import { BlockScanExplorerResolver } from '@/providers/ethereum/ExplorerResolver.js';

function DetailsGroup(props: { field: ReactNode; value: ReactNode }) {
    return (
        <div className="flex w-full gap-[30px] text-base font-normal leading-6">
            <div className="w-[144px] min-w-[144px] whitespace-nowrap text-secondary">{props.field}:</div>
            <div className="flex-1 text-base">{props.value}</div>
        </div>
    );
}

function EVMExplorerLink(props: { address: string; type: 'address' | 'tx'; chainId?: number; useBlockScan?: boolean }) {
    if (props.chainId) {
        const ExplorerResolver = props.useBlockScan ? BlockScanExplorerResolver : EVMExplorerResolver;
        const resolveExplorerLink = {
            address: ExplorerResolver.addressLink.bind(ExplorerResolver),
            tx: EVMExplorerResolver.transactionLink.bind(EVMExplorerResolver),
        }[props.type];
        return (
            <span className="break-all">
                {props.address}
                <span className="ml-1">
                    <CopyTextButton value={props.address} />
                </span>
                <a
                    href={resolveExplorerLink(props.chainId, props.address)}
                    target="_blank"
                    className="ml-1 inline-block"
                >
                    <LinkIcon className="h-3 w-3" />
                </a>
            </span>
        );
    }
    return <span className="break-all">{props.address}</span>;
}

function convertDescriptionToArray(description: string): ReactNode[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = description.split(urlRegex);

    return parts.map((part, i) => {
        if (/(https?:\/\/[^\s]+)/.test(part)) {
            return (
                <Link key={`${part}-${i}`} href={part} target="_blank" className="break-all text-highlight underline">
                    {part}
                </Link>
            );
        }
        return part;
    });
}

interface NFTOverflowProps {
    description: string;
    tokenId?: string;
    creator?: string;
    mintingTxnHash?: string;
    mintingDate?: string;
    contractAddress?: string;
    chainId?: number;
    schemaType?: SchemaType;
}

export function NFTOverflow(props: NFTOverflowProps) {
    const description = useMemo(() => convertDescriptionToArray(props.description), [props.description]);
    return (
        <div className="space-y-8">
            {props.description ? (
                <div className="space-y-2">
                    <h3 className="text-xl font-bold leading-6">
                        <Trans>Description</Trans>
                    </h3>
                    <p className="w-full whitespace-pre-line break-words text-sm font-normal leading-5 sm:break-normal">
                        {description}
                    </p>
                </div>
            ) : null}
            <div className="space-y-2">
                <h3 className="text-xl font-bold leading-6">
                    <Trans>Details</Trans>
                </h3>
                <div className="space-y-4">
                    {props.schemaType ? (
                        <DetailsGroup
                            field={t`NFT Standard`}
                            value={
                                <div className="flex items-center">
                                    {
                                        {
                                            [SchemaType.Native]: 'Native',
                                            [SchemaType.ERC721]: 'ERC721',
                                            [SchemaType.ERC1155]: 'ERC1155',
                                            [SchemaType.ERC20]: 'ERC20',
                                            [SchemaType.SBT]: 'SBT',
                                        }[props.schemaType]
                                    }
                                </div>
                            }
                        />
                    ) : null}
                    {props.tokenId ? (
                        <DetailsGroup field={t`NFT ID`} value={<span className="break-all">#{props.tokenId}</span>} />
                    ) : null}
                    {props.chainId ? (
                        <DetailsGroup
                            field={t`Blockchain`}
                            value={
                                <div className="flex items-center">
                                    <span className="mr-1">
                                        <ChainIcon chainId={props.chainId} size={20} />
                                    </span>
                                    <span className="capitalize">{resolveSimpleHashChain(props.chainId)}</span>
                                </div>
                            }
                        />
                    ) : null}
                    {props.contractAddress ? (
                        <DetailsGroup
                            field={t`NFT Contract`}
                            value={
                                <EVMExplorerLink
                                    address={props.contractAddress}
                                    type="address"
                                    chainId={props.chainId}
                                />
                            }
                        />
                    ) : null}
                    {props.creator ? (
                        <DetailsGroup
                            field={t`Creator`}
                            value={
                                <EVMExplorerLink
                                    useBlockScan
                                    address={props.creator}
                                    type="address"
                                    chainId={props.chainId}
                                />
                            }
                        />
                    ) : null}
                    {props.mintingTxnHash ? (
                        <DetailsGroup
                            field={t`Minting Txn Hash`}
                            value={<EVMExplorerLink address={props.mintingTxnHash} type="tx" chainId={props.chainId} />}
                        />
                    ) : null}
                    {props.mintingDate ? <DetailsGroup field={t`Minting Date`} value={props.mintingDate} /> : null}
                </div>
            </div>
        </div>
    );
}
