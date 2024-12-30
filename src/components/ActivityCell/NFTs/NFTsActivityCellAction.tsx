'use client';

import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import type { NonFungibleAsset } from '@masknet/web3-shared-base';
import { ChainId, SchemaType } from '@masknet/web3-shared-evm';
import { pick } from 'lodash-es';

import AcquiredIcon from '@/assets/acquired.svg';
import BoughtIcon from '@/assets/bought.svg';
import BurnIcon from '@/assets/burn.svg';
import MintIcon from '@/assets/minted.svg';
import SentIcon from '@/assets/sent.svg';
import SoldIcon from '@/assets/sold.svg';
import { ActivityCellAction } from '@/components/ActivityCell/ActivityCellAction.js';
import { ActivityCellActionTag } from '@/components/ActivityCell/ActivityCellActionTag.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Image } from '@/components/Image.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { useNFTDetail } from '@/hooks/useNFTDetail.js';
import { NFTFeedTransAction } from '@/providers/types/NFTs.js';

interface Props {
    chainId: ChainId;
    address: string;
    tokenId: string;
    action: NFTFeedTransAction;
    tokenCount?: number;
    ownerAddress?: string;
    toAddress?: string;
    fromAddress?: string;
}

const tagClassName = 'flex items-center space-x-1 rounded-lg bg-bg px-2 h-6 leading-6 truncate cursor-pointer';

function NFTsActivityCellActionCollectionName({
    asset,
    chainId,
    address,
}: { asset?: NonFungibleAsset<ChainId, SchemaType> | null } & Pick<Props, 'chainId' | 'address'>) {
    if (!asset?.collection) return null;

    return (
        <Link
            href={resolveNftUrl(chainId, address)}
            className={tagClassName}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {asset.collection.iconURL ? (
                <Image
                    src={asset.collection.iconURL}
                    alt={asset.collection.name}
                    className="size-[18px] shrink-0 rounded-[6px]"
                    width={18}
                    height={18}
                />
            ) : null}
            <div className="truncate">{asset.collection.name}</div>
        </Link>
    );
}

function NFTsActivityCellActionPoapName({
    asset,
    chainId,
    address,
}: { asset?: NonFungibleAsset<ChainId, SchemaType> | null } & Pick<Props, 'chainId' | 'address'>) {
    if (!asset?.metadata) return null;

    return (
        <Link href={resolveNftUrl(chainId, address)} className={tagClassName}>
            {asset.metadata.imageURL ? (
                <Image
                    src={asset.metadata.imageURL}
                    alt={asset.metadata.name}
                    className="size-[18px] shrink-0 rounded-[6px]"
                />
            ) : null}
            <div className="truncate">{asset.metadata.name}</div>
        </Link>
    );
}

export function NFTsActivityCellAction(props: Props) {
    const { action, toAddress, ownerAddress, fromAddress, tokenCount, address, chainId, tokenId } = props;
    const { data, isLoading } = useNFTDetail(address, tokenId, chainId);
    switch (action) {
        case NFTFeedTransAction.Mint:
            return (
                <ActivityCellAction>
                    <Trans>
                        <ActivityCellActionTag icon={<MintIcon />}>Minted</ActivityCellActionTag>
                        <NFTsActivityCellActionCollectionName asset={data} {...pick(props, 'chainId', 'address')} />
                        {tokenCount && tokenCount > 1 ? <div className={tagClassName}>× {tokenCount}</div> : null}
                    </Trans>
                </ActivityCellAction>
            );
        case NFTFeedTransAction.Transfer:
            const isAcquired = isSameEthereumAddress(toAddress, ownerAddress);
            if (isAcquired) {
                return (
                    <ActivityCellAction>
                        {fromAddress ? (
                            <Trans>
                                <ActivityCellActionTag icon={<AcquiredIcon />}>Acquired</ActivityCellActionTag>
                                <NFTsActivityCellActionCollectionName
                                    asset={data}
                                    {...pick(props, 'chainId', 'address')}
                                />
                                <span>from</span>
                                <ClickableArea className="whitespace-nowrap">
                                    <Link
                                        href={resolveProfileUrl(Source.Wallet, fromAddress)}
                                        className="truncate text-highlight hover:underline"
                                    >
                                        {formatEthereumAddress(fromAddress, 4)}
                                    </Link>
                                </ClickableArea>
                            </Trans>
                        ) : (
                            <Trans>
                                <ActivityCellActionTag icon={<AcquiredIcon />}>Acquired</ActivityCellActionTag>
                                <NFTsActivityCellActionCollectionName
                                    asset={data}
                                    {...pick(props, 'chainId', 'address')}
                                />
                            </Trans>
                        )}
                    </ActivityCellAction>
                );
            }
            return (
                <ActivityCellAction>
                    {toAddress ? (
                        <Trans>
                            <ActivityCellActionTag icon={<SentIcon />}>Sent</ActivityCellActionTag>
                            <NFTsActivityCellActionCollectionName asset={data} {...pick(props, 'chainId', 'address')} />
                            <span>to</span>
                            <ClickableArea className="whitespace-nowrap">
                                <Link
                                    href={resolveProfileUrl(Source.Wallet, fromAddress)}
                                    className="truncate text-highlight hover:underline"
                                >
                                    {formatEthereumAddress(toAddress, 4)}
                                </Link>
                            </ClickableArea>
                        </Trans>
                    ) : (
                        <Trans>
                            <ActivityCellActionTag icon={<SentIcon />}>Sent</ActivityCellActionTag>
                            <NFTsActivityCellActionCollectionName asset={data} {...pick(props, 'chainId', 'address')} />
                        </Trans>
                    )}
                </ActivityCellAction>
            );
        case NFTFeedTransAction.Burn:
            return (
                <ActivityCellAction>
                    <Trans>
                        <ActivityCellActionTag icon={<BurnIcon />}>Burned</ActivityCellActionTag>
                        <NFTsActivityCellActionCollectionName asset={data} {...pick(props, 'chainId', 'address')} />
                    </Trans>
                </ActivityCellAction>
            );
        case NFTFeedTransAction.Trade:
            const isBuy = isSameEthereumAddress(toAddress, ownerAddress);
            if (isBuy) {
                return (
                    <ActivityCellAction>
                        <Trans>
                            <ActivityCellActionTag icon={<BoughtIcon />}>Bought</ActivityCellActionTag>
                            <NFTsActivityCellActionCollectionName asset={data} {...pick(props, 'chainId', 'address')} />
                        </Trans>
                    </ActivityCellAction>
                );
            }
            return (
                <ActivityCellAction>
                    <Trans>
                        <ActivityCellActionTag icon={<SoldIcon />}>Sold</ActivityCellActionTag>
                        <NFTsActivityCellActionCollectionName asset={data} {...pick(props, 'chainId', 'address')} />
                    </Trans>
                </ActivityCellAction>
            );
        case NFTFeedTransAction.Poap:
            return (
                <ActivityCellAction>
                    <Trans>
                        <ActivityCellActionTag icon={<MintIcon />}>Collected</ActivityCellActionTag>
                        <NFTsActivityCellActionPoapName asset={data} {...pick(props, 'chainId', 'address')} />
                    </Trans>
                </ActivityCellAction>
            );
        default:
            safeUnreachable(action);
            return null;
    }
}
