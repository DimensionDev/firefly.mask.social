'use client';

import { t } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';
import { type ReactNode } from 'react';

import LineArrowUp from '@/assets/line-arrow-up.svg';
import LinkIcon from '@/assets/link-square.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Image } from '@/components/Image.js';
import { NFTFeedAction, type NFTFeedActionProps } from '@/components/NFTs/NFTFeedAction.js';
import { TokenPrice } from '@/components/TokenPrice.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { getFloorPrice } from '@/helpers/getFloorPrice.js';
import { resolveCoinGeckoTokenSymbol } from '@/helpers/resolveCoinGeckoTokenSymbol.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { useNFTDetail } from '@/hooks/useNFTDetail.js';

function NFTFeedFieldGroup({
    field,
    value,
    isLoading = false,
}: {
    field: ReactNode;
    value: ReactNode;
    isLoading?: boolean;
}) {
    return (
        <div
            className={classNames('flex w-full justify-between space-x-1', {
                'animate-pulse': isLoading,
            })}
        >
            <div className="text-second">{field}</div>
            <div className="max-w-[calc(100%-100px)] truncate font-bold text-main">{value}</div>
        </div>
    );
}

function NFTItem({ address, tokenId, chainId }: { address: string; tokenId: string; chainId?: ChainId }) {
    const { data, isLoading, error } = useNFTDetail(address, tokenId, chainId);
    const tokenName = data?.metadata?.name;
    const collectionName = data?.collection?.name;

    return (
        <div className="mt-auto flex w-full flex-col rounded-xl bg-lightBg p-3 sm:h-[120px] sm:flex-row sm:space-x-2 sm:rounded-none sm:bg-transparent sm:p-0">
            {isLoading ? (
                <div className="mb-2 aspect-square h-full w-full animate-pulse rounded-xl bg-main/40 sm:mb-0 sm:w-auto" />
            ) : (
                <Image
                    src={data?.metadata?.imageURL || ''}
                    width={120}
                    height={120}
                    className="mb-2 aspect-square h-full w-full rounded-xl object-cover sm:mb-0 sm:w-auto"
                    alt={address}
                />
            )}
            <div className="h-[96px] w-full space-y-2 rounded-xl text-sm leading-[18px] sm:h-auto sm:w-[calc(100%-120px-8px)] sm:bg-lightBg sm:p-3">
                <NFTFeedFieldGroup
                    field={t`Name`}
                    value={
                        <div className="flex items-center hover:underline">
                            <div className="max-w-[calc(100%-22px)] truncate">{tokenName}</div>
                            <LinkIcon width={18} height={18} className="ml-1 text-second" />
                        </div>
                    }
                    isLoading={isLoading}
                />
                <NFTFeedFieldGroup
                    field={t`Collection`}
                    value={
                        <Link
                            className="flex items-center hover:underline"
                            href={resolveNftUrl(address, {
                                chainId,
                            })}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="max-w-[calc(100%-22px)] truncate">{collectionName}</div>
                            <LinkIcon width={18} height={18} className="ml-1 text-second" />
                        </Link>
                    }
                    isLoading={isLoading}
                />
                <NFTFeedFieldGroup field={t`Token ID`} value={data?.tokenId ?? tokenId} />
                {!isLoading && data?.collection?.floorPrices?.length === 0 ? null : (
                    <NFTFeedFieldGroup
                        isLoading={isLoading}
                        field={t`Floor Price`}
                        value={
                            data?.collection?.floorPrices && data.collection.floorPrices.length > 0 ? (
                                <>
                                    {getFloorPrice(data.collection.floorPrices)}
                                    <TokenPrice
                                        value={data.collection.floorPrices[0].value}
                                        symbol={resolveCoinGeckoTokenSymbol(
                                            data.collection.floorPrices[0].payment_token.symbol,
                                        )}
                                        prefix=" ($"
                                        suffix=")"
                                        decimals={data.collection.floorPrices[0].payment_token.decimals}
                                        target="usd"
                                    />
                                </>
                            ) : null
                        }
                    />
                )}
            </div>
        </div>
    );
}

export interface NFTFeedBodyProps {
    tokenList: Array<{ id: string; contractAddress: string; action: NFTFeedActionProps }>;
    onChangeIndex?: (index: number) => void;
    index?: number;
    chainId?: ChainId;
}

export function NFTFeedBody({ index = 0, onChangeIndex, tokenList, chainId }: NFTFeedBodyProps) {
    const activeToken = tokenList[index];
    return (
        <div className="w-full space-y-1.5 pl-[52px]">
            {activeToken ? <NFTFeedAction {...activeToken.action} /> : null}
            <div className="relative flex w-full overflow-hidden sm:h-[120px]">
                <div
                    className="absolute left-0 grid h-full duration-300"
                    style={{
                        width: `${tokenList.length * 100}%`,
                        gridTemplateColumns: `repeat(${tokenList.length}, calc(100% / ${tokenList.length}))`,
                        transform: `translateX(${-((index / tokenList.length) * 100)}%)`,
                    }}
                >
                    {tokenList.map((token) => (
                        <NFTItem address={token.contractAddress} key={token.id} tokenId={token.id} chainId={chainId} />
                    ))}
                </div>
                {/* used for layout calculation height */}
                <div className="h-full w-full space-y-1.5 opacity-0 sm:hidden">
                    <div className="aspect-square w-full" />
                    <div className="h-[96px]" />
                </div>
            </div>
            {tokenList.length > 1 ? (
                <div className="mt-1.5 flex h-[18px] justify-between overflow-hidden text-lightSecond">
                    <ClickableButton
                        className={classNames(
                            'duration-50 rounded-full',
                            index <= 0 ? 'cursor-not-allowed opacity-50' : 'hover:bg-main/10 active:bg-main/5',
                        )}
                        onClickCapture={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (index <= 0) {
                                return;
                            }
                            onChangeIndex?.(index <= 0 ? tokenList.length - 1 : index - 1);
                        }}
                    >
                        <LineArrowUp width={18} height={18} className="-rotate-90" />
                    </ClickableButton>
                    <div
                        className="flex flex-1 cursor-default items-center justify-center space-x-[1.5px]"
                        onClickCapture={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        {tokenList.map(({ id }) => (
                            <div key={id} className="h-[3px] w-[3px] rounded-full bg-lightSecond" />
                        ))}
                    </div>
                    <ClickableButton
                        className={classNames(
                            'duration-50 rounded-full',
                            index >= tokenList.length - 1
                                ? 'cursor-not-allowed opacity-50'
                                : 'hover:bg-main/10 active:bg-main/5',
                        )}
                        onClickCapture={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (index >= tokenList.length - 1) {
                                return;
                            }
                            onChangeIndex?.(index >= tokenList.length - 1 ? 0 : index + 1);
                        }}
                    >
                        <LineArrowUp width={18} height={18} className="rotate-90" />
                    </ClickableButton>
                </div>
            ) : null}
        </div>
    );
}
