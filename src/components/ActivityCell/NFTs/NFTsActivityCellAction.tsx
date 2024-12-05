'use client';

import { Trans } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';
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

const tagClassName = 'flex items-center space-x-1 rounded-lg bg-bg px-2 h-6 leading-6 truncate';

function NFTsActivityCellActionCollectionName(props: Pick<Props, 'chainId' | 'address' | 'tokenId'>) {
    const { chainId, address, tokenId } = props;
    const { data, isLoading } = useNFTDetail(address, tokenId, chainId);

    if (!data?.collection) return null;

    return (
        <Link href={resolveNftUrl(chainId, address)} className={tagClassName}>
            {data.collection.iconURL ? (
                <Image
                    src={data.collection.iconURL}
                    alt={data.collection.name}
                    className="size-[18px] shrink-0 rounded-[6px]"
                />
            ) : null}
            <div className="truncate">{data.collection.name}</div>
        </Link>
    );
}

function NFTsActivityCellActionPoapName(props: Pick<Props, 'chainId' | 'address' | 'tokenId'>) {
    const { chainId, address, tokenId } = props;
    const { data, isLoading } = useNFTDetail(address, tokenId, chainId);

    if (!data?.metadata) return null;

    return (
        <div className={tagClassName}>
            {data.metadata.imageURL ? (
                <Image
                    src={data.metadata.imageURL}
                    alt={data.metadata.name}
                    className="size-[18px] shrink-0 rounded-[6px]"
                />
            ) : null}
            <div className="truncate">{data.metadata.name}</div>
        </div>
    );
}

export function NFTsActivityCellAction(props: Props) {
    const { action, toAddress, ownerAddress, fromAddress } = props;
    switch (action) {
        case NFTFeedTransAction.Mint:
            return (
                <ActivityCellAction>
                    <ActivityCellActionTag icon={<MintIcon />}>
                        <Trans>Minted</Trans>
                    </ActivityCellActionTag>
                    <NFTsActivityCellActionCollectionName {...pick(props, 'chainId', 'address', 'tokenId')} />
                </ActivityCellAction>
            );
        case NFTFeedTransAction.Transfer:
            const isAcquired = isSameEthereumAddress(toAddress, ownerAddress);
            if (isAcquired) {
                return (
                    <ActivityCellAction>
                        <ActivityCellActionTag icon={<AcquiredIcon />}>
                            <Trans>Acquired</Trans>
                        </ActivityCellActionTag>
                        <NFTsActivityCellActionCollectionName {...pick(props, 'chainId', 'address', 'tokenId')} />
                        {fromAddress ? (
                            <ClickableArea className="whitespace-nowrap">
                                <Trans>
                                    from{' '}
                                    <Link
                                        href={resolveProfileUrl(Source.Wallet, fromAddress)}
                                        className="truncate text-highlight hover:underline"
                                    >
                                        {formatEthereumAddress(fromAddress, 4)}
                                    </Link>
                                </Trans>
                            </ClickableArea>
                        ) : null}
                    </ActivityCellAction>
                );
            }
            return (
                <ActivityCellAction>
                    <ActivityCellActionTag icon={<SentIcon />}>
                        <Trans>Sent</Trans>
                    </ActivityCellActionTag>
                    <NFTsActivityCellActionCollectionName {...pick(props, 'chainId', 'address', 'tokenId')} />
                    {toAddress ? (
                        <ClickableArea className="whitespace-nowrap">
                            <Trans>
                                to{' '}
                                <Link
                                    href={resolveProfileUrl(Source.Wallet, fromAddress)}
                                    className="truncate text-highlight hover:underline"
                                >
                                    {formatEthereumAddress(toAddress, 4)}
                                </Link>
                            </Trans>
                        </ClickableArea>
                    ) : null}
                </ActivityCellAction>
            );
        case NFTFeedTransAction.Burn:
            return (
                <ActivityCellAction>
                    <ActivityCellActionTag icon={<BurnIcon />}>
                        <Trans>Burn</Trans>
                    </ActivityCellActionTag>
                    <NFTsActivityCellActionCollectionName {...pick(props, 'chainId', 'address', 'tokenId')} />
                </ActivityCellAction>
            );
        case NFTFeedTransAction.Trade:
            const isBuy = isSameEthereumAddress(toAddress, ownerAddress);
            if (isBuy) {
                return (
                    <ActivityCellAction>
                        <ActivityCellActionTag icon={<BoughtIcon />}>
                            <Trans>Bought</Trans>
                        </ActivityCellActionTag>
                        <NFTsActivityCellActionCollectionName {...pick(props, 'chainId', 'address', 'tokenId')} />
                    </ActivityCellAction>
                );
            }
            return (
                <ActivityCellAction>
                    <ActivityCellActionTag icon={<SoldIcon />}>
                        <Trans>Sold</Trans>
                    </ActivityCellActionTag>
                    <NFTsActivityCellActionCollectionName {...pick(props, 'chainId', 'address', 'tokenId')} />
                </ActivityCellAction>
            );
        case NFTFeedTransAction.Poap:
            return (
                <ActivityCellAction>
                    <ActivityCellActionTag icon={<MintIcon />}>
                        <Trans>Collect</Trans>
                    </ActivityCellActionTag>
                    <NFTsActivityCellActionPoapName {...pick(props, 'chainId', 'address', 'tokenId')} />
                </ActivityCellAction>
            );
        default:
            return null;
    }
}
