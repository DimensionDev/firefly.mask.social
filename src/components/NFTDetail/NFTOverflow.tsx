'use client';

import { t, Trans } from '@lingui/macro';
import { EVMExplorerResolver } from '@masknet/web3-providers';
import { SchemaType } from '@masknet/web3-shared-evm';
import type { ReactNode } from 'react';

import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { Link } from '@/esm/Link.js';

export interface NFTOverflowProps {
    description: string;
    tokenId?: string;
    creator?: string;
    mintingTxnHash?: string;
    mintingDate?: string;
    contractAddress?: string;
    chainId?: number;
    schemaType?: SchemaType;
}

export function DetailsGroup(props: { field: ReactNode; value: ReactNode }) {
    return (
        <div className="flex w-full gap-[30px]">
            <div className="w-[144px] min-w-[144px] whitespace-nowrap text-base font-normal leading-[22px] text-secondary">
                {props.field}:
            </div>
            <div className="flex-1 text-base font-medium leading-[22px]">{props.value}</div>
        </div>
    );
}

export function EVMExplorerLink(props: { address: string; chainId?: number; type: 'address' | 'tx' }) {
    if (props.chainId) {
        const resolveExplorerLink = {
            address: EVMExplorerResolver.addressLink.bind(EVMExplorerResolver),
            tx: EVMExplorerResolver.transactionLink.bind(EVMExplorerResolver),
        }[props.type];
        return (
            <span className="break-all">
                <Link
                    href={{
                        href: resolveExplorerLink(props.chainId, props.address),
                    }}
                    target="_blank"
                    className="text-[#9250FE] hover:underline"
                >
                    {props.address}
                </Link>
            </span>
        );
    }
    return <span className="break-all">{props.address}</span>;
}

export function NFTOverflow(props: NFTOverflowProps) {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h3 className="text-lg font-bold leading-6">
                    <Trans>Description</Trans>
                </h3>
                <p className="text-sm font-normal leading-5">{props.description}</p>
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-bold leading-6">
                    <Trans>Details</Trans>
                </h3>
                <div className="space-y-4">
                    {props.schemaType ? (
                        <DetailsGroup
                            field={t`NFT Standard`}
                            value={
                                {
                                    [SchemaType.Native]: 'Native',
                                    [SchemaType.ERC721]: 'ERC721',
                                    [SchemaType.ERC1155]: 'ERC1155',
                                    [SchemaType.ERC20]: 'ERC20',
                                    [SchemaType.SBT]: 'SBT',
                                }[props.schemaType]
                            }
                        />
                    ) : null}
                    {props.tokenId ? (
                        <DetailsGroup field={t`NFT ID`} value={<span className="break-all">#{props.tokenId}</span>} />
                    ) : null}
                    {props.chainId ? (
                        <DetailsGroup field={t`Blockchain`} value={<ChainIcon chainId={props.chainId} />} />
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
                            value={<EVMExplorerLink address={props.creator} type="address" />}
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
