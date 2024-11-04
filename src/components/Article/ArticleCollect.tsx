import { t, Trans } from '@lingui/macro';
import { EVMChainResolver } from '@masknet/web3-providers';
import { useQuery } from '@tanstack/react-query';
import { estimateFeesPerGas, getBalance } from '@wagmi/core';
import { produce } from 'immer';
import { useMemo, useRef } from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount, useChains } from 'wagmi';

import CollectFillIcon from '@/assets/collect-fill.svg';
import LoadingIcon from '@/assets/loading.svg';
import { Avatar } from '@/components/Avatar.js';
import { ChainGuardButton } from '@/components/ChainGuardButton.js';
import { queryClient } from '@/configs/queryClient.js';
import { config } from '@/configs/wagmiClient.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { getArticleDigest } from '@/helpers/getArticleDigest.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { multipliedBy, rightShift, ZERO } from '@/helpers/number.js';
import { resolveArticleCollectProvider } from '@/helpers/resolveArticleCollectProvider.js';
import { type Article } from '@/providers/types/Article.js';

export interface ArticleCollectProps {
    article: Article;
}

export function ArticleCollect({ article }: ArticleCollectProps) {
    const account = useAccount();
    const chains = useChains();

    const platform = article.platform;

    const queryKey = ['article', platform, article.id, article.origin, account.address];
    const queryKeyRef = useRef(queryKey);
    queryKeyRef.current = queryKey;
    const { data: result, isLoading: queryDetailLoading } = useQuery({
        queryKey,
        queryFn: async () => {
            const digest = getArticleDigest(article);
            if (!digest) return null;
            const provider = resolveArticleCollectProvider(platform);
            if (!provider) return null;

            const data = await provider.getArticleCollectableByDigest(digest);

            if (!account.address)
                return {
                    data,
                    insufficientBalance: true,
                };

            try {
                const isEIP1559 = EVMChainResolver.isFeatureSupported(data.chainId, 'EIP1559');
                const { gasPrice, maxFeePerGas } = await estimateFeesPerGas(config, {
                    chainId: data.chainId,
                    type: isEIP1559 ? 'eip1559' : 'legacy',
                });

                const gasLimit = await provider.estimateCollectGas(data);

                const balance = await getBalance(config, {
                    address: account.address,
                    chainId: data.chainId,
                });

                const gasFee = isEIP1559
                    ? !maxFeePerGas
                        ? ZERO
                        : multipliedBy(maxFeePerGas.toString(), gasLimit.toString())
                    : !gasPrice
                      ? ZERO
                      : multipliedBy(gasPrice.toString(), gasLimit.toString());
                const price = data.price ? BigInt(rightShift(data.price, 18).toString()) : 0n;

                const cost = price + data.fee + BigInt(gasFee.toString());

                return {
                    data,
                    insufficientBalance: cost > balance.value,
                };
            } catch {
                return {
                    data,
                    insufficientBalance: true,
                };
            }
        },
    });

    const { data, insufficientBalance } = result ?? {};

    const [{ loading: collectLoading }, handleCollect] = useAsyncFn(async () => {
        if (!data || !platform) return;

        const provider = resolveArticleCollectProvider(platform);
        if (!provider) return;
        try {
            const confirmation = await provider.collect(data);
            if (!confirmation) return;
            queryClient.setQueryData<typeof result>(queryKeyRef.current, (data) => {
                if (!data) return data;
                return produce(data, (draft) => {
                    draft.data.isCollected = true;
                });
            });
            enqueueSuccessMessage(t`Article collected successfully!`);
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to collect article.`), { error });
            throw error;
        }
    }, [account, data, platform]);

    const chain = chains.find((x) => x.id === data?.chainId);
    const isSoldOut = !!data?.quantity && data.soldCount >= data.quantity;

    const buttonText = useMemo(() => {
        if (isSoldOut) return t`Sold Out`;
        if (insufficientBalance) return t`Insufficient Balance`;
        if (!data?.price) return t`Free Collect`;
        return t`Collect for ${data.price} ${chain?.nativeCurrency.symbol}`;
    }, [data, chain, isSoldOut, insufficientBalance]);

    if (!queryDetailLoading && !data) {
        return (
            <div className="flex h-[198px] w-full items-center justify-center">
                <div className="text-[14px] leading-[24px] text-secondary">
                    <Trans>This article is no longer available</Trans>
                </div>
            </div>
        );
    }

    if (queryDetailLoading) {
        return (
            <div className="flex h-[198px] w-full items-center justify-center">
                <LoadingIcon className="animate-spin text-main" width={24} height={24} />
            </div>
        );
    }

    return (
        <div className="overflow-x-hidden px-6 pb-6 max-md:px-0 max-md:pb-4">
            <div className="my-3 rounded-lg bg-lightBg px-3 py-2">
                <div className="line-clamp-2 text-left text-base font-bold leading-5 text-fourMain">
                    {article.title}
                </div>
                {article.author ? (
                    <div className="mt-[6px] flex items-center gap-2">
                        <Avatar src={article.author.avatar} size={20} alt={article.author.handle} />
                        <span className="text-medium leading-[24px] text-lightSecond">
                            {article.author.handle ?? formatEthereumAddress(article.author.id, 4)}
                        </span>
                        {data?.isCollected ? (
                            <CollectFillIcon width={16} height={16} className="ml-auto mr-1.5" />
                        ) : null}
                    </div>
                ) : null}
            </div>

            <div className="flex items-center justify-center gap-7 text-sm leading-[22px]">
                <div className="flex flex-col items-center">
                    <div className="font-bold text-main">
                        <span>{data?.soldCount}</span>
                        {data?.quantity ? <span>/ {data.quantity}</span> : null}
                    </div>
                    <div className="text-second">
                        <Trans>Collected</Trans>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="font-bold text-main">ERC721</div>
                    <div className="text-second">
                        <Trans>Standard</Trans>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="font-bold text-main">{chain?.name}</div>
                    <div className="text-second">
                        <Trans>Network</Trans>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="font-bold text-main">{data?.price ? data.price : t`Free`}</div>
                    <div className="text-second">
                        <Trans>Cost</Trans>
                    </div>
                </div>
            </div>

            <ChainGuardButton
                targetChainId={data?.chainId}
                className="mt-6 w-full max-md:mt-4"
                disabled={isSoldOut || (account.isConnected && insufficientBalance)}
                loading={collectLoading || queryDetailLoading}
                onClick={handleCollect}
            >
                {buttonText}
            </ChainGuardButton>
        </div>
    );
}
