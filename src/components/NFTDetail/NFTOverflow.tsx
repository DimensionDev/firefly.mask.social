'use client';

import { t, Trans } from '@lingui/macro';
import { NetworkPluginID } from '@masknet/shared-base';
import { EVMExplorerResolver } from '@masknet/web3-providers';
import { SchemaType } from '@masknet/web3-shared-evm';
import type { ReactNode } from 'react';

import LinkIcon from '@/assets/link-square.svg';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { CopyButton } from '@/components/NFTDetail/CopyButton.js';
import { Link } from '@/esm/Link.js';
// eslint-disable-next-line no-restricted-imports
import { resolveChain } from '@/maskbook/packages/web3-providers/src/SimpleHash/helpers.js';

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
        <div className="flex w-full gap-[30px] text-base font-normal leading-6">
            <div className="w-[144px] min-w-[144px] whitespace-nowrap text-secondary">{props.field}:</div>
            <div className="flex-1 text-base">{props.value}</div>
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
                {props.address}
                <span className="ml-1">
                    <CopyButton value={props.address} />
                </span>
                <Link
                    href={{
                        href: resolveExplorerLink(props.chainId, props.address),
                    }}
                    target="_blank"
                    className="ml-1 inline-block"
                >
                    <LinkIcon className="h-3 w-3" />
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
                <p className="w-full break-words text-sm font-normal leading-5 sm:break-normal">{props.description}</p>
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
                                <div className="flex items-center">
                                    {props.chainId ? (
                                        <span className="mr-1">
                                            <ChainIcon size={20} chainId={props.chainId} />
                                        </span>
                                    ) : null}
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
                                    <span className="capitalize">
                                        {resolveChain(NetworkPluginID.PLUGIN_EVM, props.chainId)}
                                    </span>
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
                            value={<EVMExplorerLink address={props.creator} type="address" chainId={props.chainId} />}
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
