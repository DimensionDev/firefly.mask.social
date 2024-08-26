'use client';

import { t } from '@lingui/macro';
import type { NonFungibleAsset } from '@masknet/web3-shared-base';
import { ChainId, type SchemaType } from '@masknet/web3-shared-evm';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { isUndefined } from 'lodash-es';
import { type ReactNode, useMemo, useState } from 'react';

import LineArrowUp from '@/assets/line-arrow-up.svg';
import LinkIcon from '@/assets/link-square.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { NFTImage } from '@/components/NFTImage.js';
import { NFTFeedAction, type NFTFeedActionProps } from '@/components/NFTs/NFTFeedAction.js';
import { TokenPrice } from '@/components/TokenPrice.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { getFloorPrice } from '@/helpers/getFloorPrice.js';
import { resolveCoinGeckoTokenSymbol } from '@/helpers/resolveCoinGeckoTokenSymbol.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { useNFTDetail } from '@/hooks/useNFTDetail.js';
import { usePoapAttendeesCount } from '@/hooks/usePoapAttendeesCount.js';
import { NFTFeedTransAction } from '@/providers/types/NFTs.js';

const variants = {
    enter: (direction: number) => {
        return {
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
        };
    },
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => {
        return {
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
        };
    },
};

function wrap(min: number, max: number, v: number) {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
}

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

function PoapFieldGroups({
    eventId,
    asset,
    isLoading,
}: {
    eventId: number;
    asset: NonFungibleAsset<ChainId, SchemaType>;
    isLoading?: boolean;
}) {
    const { data: attendeesCount, isLoading: isLoadingAttendeesCount } = usePoapAttendeesCount(eventId);
    const date = useMemo(() => {
        if (!asset.traits) return null;
        const startDate = asset.traits?.find((trait) => trait.type === 'startDate');
        const endDate = asset.traits?.find((trait) => trait.type === 'endDate');
        if (!startDate || !endDate) return null;
        // cspell: disable-next-line
        return `${dayjs(startDate.value).format('MMMDD')}-${dayjs(endDate.value).format('MMMDD')}`;
    }, [asset.traits]);
    const city = useMemo(() => asset.traits?.find((trait) => trait.type === 'city')?.value, [asset.traits]);

    return (
        <>
            <NFTFeedFieldGroup field={t`Date`} value={date} isLoading={isLoading} />
            <NFTFeedFieldGroup field={t`Location`} value={city} isLoading={isLoading} />
            <NFTFeedFieldGroup
                isLoading={isLoading || isLoadingAttendeesCount}
                field={t`Attendees`}
                value={attendeesCount ? nFormatter(attendeesCount) : null}
            />
        </>
    );
}

function NFTItem({
    address,
    tokenId,
    chainId,
    action,
}: {
    address: string;
    tokenId: string;
    chainId?: ChainId;
    action?: NFTFeedTransAction;
}) {
    const { data, isLoading } = useNFTDetail(address, tokenId, chainId);
    const metadata = data?.metadata;
    const tokenName = metadata?.name;
    const collectionName = data?.collection?.name;

    return (
        <div className="mt-auto flex w-full flex-col rounded-xl border border-line bg-lightBg p-3 sm:h-[120px] sm:flex-row sm:space-x-2 sm:rounded-none sm:border-none sm:bg-transparent sm:p-0">
            {isLoading ? (
                <div className="mb-2 aspect-square h-full w-full animate-pulse rounded-xl bg-main/40 sm:mb-0 sm:w-auto" />
            ) : (
                <NFTImage
                    src={metadata?.previewImageURL || metadata?.imageURL || ''}
                    width={120}
                    height={120}
                    className="mb-2 aspect-square h-full w-full rounded-xl object-cover sm:mb-0 sm:w-auto"
                    draggable={false}
                    alt={address}
                />
            )}
            <div className="w-full space-y-2 rounded-xl text-sm leading-[18px] sm:h-auto sm:w-[calc(100%-120px-8px)] sm:border sm:border-secondaryLine sm:bg-lightBg sm:p-3">
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
                {action === NFTFeedTransAction.Poap && !isUndefined(data?.metadata?.eventId) ? (
                    <PoapFieldGroups eventId={data.metadata.eventId} asset={data} isLoading={isLoading} />
                ) : (
                    <>
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
                        {!data?.collection?.floorPrices?.length ? null : (
                            <NFTFeedFieldGroup
                                isLoading={isLoading}
                                field={t`Floor Price`}
                                value={
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
                                }
                            />
                        )}
                    </>
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
    const [direction, setDirection] = useState(0);
    const tokenIndex = wrap(0, tokenList.length, index);
    const activeToken = tokenList[tokenIndex];

    const paginate = (newDirection: number) => {
        onChangeIndex?.(index + newDirection);
        setDirection(newDirection);
    };

    return (
        <div className="w-full space-y-1.5">
            {activeToken ? <NFTFeedAction {...activeToken.action} /> : null}
            <div className="flex w-full overflow-hidden sm:h-[120px]">
                <div className="h-auto w-full sm:h-[120px]">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={tokenIndex}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="h-auto w-full sm:h-[120px]"
                            transition={{
                                x: { type: 'spring', stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 },
                            }}
                        >
                            {activeToken ? (
                                <NFTItem
                                    address={activeToken.contractAddress}
                                    key={activeToken.id}
                                    tokenId={activeToken.id}
                                    chainId={chainId}
                                    action={activeToken.action.action}
                                />
                            ) : null}
                        </motion.div>
                    </AnimatePresence>
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
                            paginate(-1);
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
                        {tokenList.slice(0, 5).map(({ id }) => (
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
                            paginate(1);
                        }}
                    >
                        <LineArrowUp width={18} height={18} className="rotate-90" />
                    </ClickableButton>
                </div>
            ) : null}
        </div>
    );
}
