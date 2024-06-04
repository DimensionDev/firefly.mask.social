'use client';

import { t } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';
import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode, useState } from 'react';

import LineArrowUp from '@/assets/line-arrow-up.svg';
import { Image } from '@/components/Image.js';
import { NFTFeedAction, type NFTFeedActionProps } from '@/components/NFTs/NFTFeedAction.js';
import { classNames } from '@/helpers/classNames.js';
import { getFloorPrice } from '@/helpers/getFloorPrice.js';
import { useNFTDetail } from '@/hooks/useNFTDetail.js';

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
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
        };
    },
};

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
        <div className="mt-auto flex h-[120px] w-full space-x-2">
            {isLoading ? (
                <div className="aspect-square h-full animate-pulse rounded-xl bg-main/40" />
            ) : (
                <Image
                    src={data?.metadata?.imageURL || ''}
                    width={120}
                    height={120}
                    className="aspect-square h-full rounded-xl object-cover"
                    alt={address}
                />
            )}
            <div className="w-[calc(100%-120px-8px)] space-y-2 rounded-xl bg-lightBg p-3 text-sm leading-[18px]">
                <NFTFeedFieldGroup field={t`Name`} value={<>{tokenName}</>} isLoading={isLoading} />
                <NFTFeedFieldGroup field={t`Collection`} value={collectionName} isLoading={isLoading} />
                <NFTFeedFieldGroup field={t`Token ID`} value={data?.tokenId ?? tokenId} />
                {!isLoading && data?.collection?.floorPrices?.length === 0 ? null : (
                    <NFTFeedFieldGroup
                        isLoading={isLoading}
                        field={t`Floor Price`}
                        value={data?.collection?.floorPrices ? getFloorPrice(data?.collection?.floorPrices) : null}
                    />
                )}
            </div>
        </div>
    );
}

enum Direction {
    Left = -1,
    Right = 1,
}

export interface NFTFeedBodyProps {
    tokenList: Array<{ id: string; contractAddress: string } & NFTFeedActionProps>;
    onChangeIndex?: (index: number) => void;
    index?: number;
    chainId?: ChainId;
}

export function NFTFeedBody({ index = 0, onChangeIndex, tokenList, chainId }: NFTFeedBodyProps) {
    const [direction, setDirection] = useState<Direction>(Direction.Left);
    const token = tokenList[index];

    if (!token) return null;

    return (
        <div className="-mt-2 w-full space-y-1.5 pl-[52px]">
            <div className="relative flex h-[150px] w-full overflow-hidden">
                <AnimatePresence initial={false}>
                    <motion.div
                        key={`${token.contractAddress}-${token.id}-${index}`}
                        className="bottom absolute left-0 h-full w-full space-y-1.5"
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: 'spring', stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                        }}
                    >
                        <NFTFeedAction action={token.action} transferTo={token.transferTo} />
                        <NFTItem address={token.contractAddress} tokenId={token.id} chainId={chainId} />
                    </motion.div>
                </AnimatePresence>
            </div>
            {tokenList.length > 1 ? (
                <div className="mt-1.5 flex h-[18px] justify-between overflow-hidden text-lightSecond">
                    <button
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
                            setDirection(Direction.Left);
                        }}
                    >
                        <LineArrowUp width={18} height={18} className="-rotate-90" />
                    </button>
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
                    <button
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
                            setDirection(Direction.Right);
                        }}
                    >
                        <LineArrowUp width={18} height={18} className="rotate-90" />
                    </button>
                </div>
            ) : null}
        </div>
    );
}
