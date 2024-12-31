import { t, Trans } from '@lingui/macro';
import { produce } from 'immer';
import { useMemo, useRef, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount, useChains } from 'wagmi';

import CollectFillIcon from '@/assets/collect-fill.svg';
import LinkIcon from '@/assets/link-square.svg';
import LoadingIcon from '@/assets/loading.svg';
import { Avatar } from '@/components/Avatar.js';
import { ChainGuardButton } from '@/components/ChainGuardButton.js';
import { queryClient } from '@/configs/queryClient.js';
import { MintStatus } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueMessageFromError, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { openWindow } from '@/helpers/openWindow.js';
import { resolveArticleCollectProvider } from '@/helpers/resolveArticleCollectProvider.js';
import { resolveExplorerLink } from '@/helpers/resolveExplorerLink.js';
import { useArticleCollectable, useArticleCollectStatus } from '@/hooks/useArticleCollectable.js';
import { MintParamsPanel } from '@/modals/FreeMintModal/MintParamsPanel.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import { captureCollectArticleEvent } from '@/providers/telemetry/captureMintEvent.js';
import { type Article, ArticlePlatform } from '@/providers/types/Article.js';

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

    const { data: result, isLoading: queryDetailLoading } = useArticleCollectable(article, queryKey);
    const { data: collectParams, isLoading: paramsLoading, isRefetching } = useArticleCollectStatus(article);

    const { data, insufficientBalance } = result ?? {};
    const canCollect = [MintStatus.Mintable, MintStatus.MintAgain].includes(
        collectParams?.mintStatus || MintStatus.NotSupported,
    );

    // User can collect again by reopen the modal
    const [modalSessionCollected, setModalSessionCollected] = useState(false);
    const [txUrl, setTxUrl] = useState<string>();
    const [{ loading: collectLoading }, handleCollect] = useAsyncFn(async () => {
        if (!data || !platform) return;

        const provider = resolveArticleCollectProvider(platform);
        if (!provider) return;
        try {
            let hash = '';
            const eventOptions = {
                wallet_address: account.address?.toLowerCase() || '',
                Article_id: article.id,
            };
            if (canCollect && collectParams?.gasStatus) {
                const result = await FireflyEndpointProvider.freeCollectArticle(
                    article.id,
                    account.address || '',
                    platform,
                );
                hash = result.hash;
                captureCollectArticleEvent({ ...eventOptions, free_mint: true });
            } else {
                const confirmation = await provider.collect(data);
                if (!confirmation) return;
                hash = confirmation.transactionHash;
                captureCollectArticleEvent({ ...eventOptions, free_mint: false });
            }
            setModalSessionCollected(true);
            const url = resolveExplorerLink(data.chainId, hash, 'tx');
            if (url) {
                setTxUrl(url);
                openWindow(url);
            }
            queryClient.setQueryData<typeof result>(queryKeyRef.current, (data) => {
                if (!data) return data;
                return produce(data, (draft) => {
                    draft.data.isCollected = true;
                    draft.data.soldCount += 1;
                });
            });
            enqueueSuccessMessage(t`Article collected successfully!`);
        } catch (error) {
            enqueueMessageFromError(error, t`Failed to collect article.`);
            throw error;
        }
    }, [account.address, data, platform, collectParams?.gasStatus, canCollect, article.id]);

    const chain = chains.find((x) => x.id === data?.chainId);
    const nativeSymbol = chain?.nativeCurrency.symbol.toUpperCase() || '';
    const isSoldOut = !!data?.quantity && data.soldCount >= data.quantity;

    const buttonText = useMemo(() => {
        if (isSoldOut) return t`Sold Out`;
        if ((data?.isCollected && platform !== ArticlePlatform.Paragraph) || modalSessionCollected) return t`Collected`;
        if (insufficientBalance) return t`Insufficient Balance`;
        if (!data?.price) return t`Free Collect`;
        return t`Collect for ${data.price} ${nativeSymbol}`;
    }, [data, nativeSymbol, isSoldOut, insufficientBalance, platform, modalSessionCollected]);

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

    const loading = collectLoading || queryDetailLoading || paramsLoading || isRefetching;
    const disabled = isSoldOut || (account.isConnected && insufficientBalance) || modalSessionCollected || loading;
    const panelData = canCollect ? collectParams : result?.mintMetadata;

    return (
        <div className="overflow-x-hidden px-6 pb-6 max-md:px-0 max-md:pb-4">
            <div className="mb-6 rounded-lg border border-secondaryLine px-3 py-2">
                <div className="line-clamp-2 text-left text-base font-bold leading-5 text-main">{article.title}</div>
                {article.author ? (
                    <div className="mt-[6px] flex items-center gap-2">
                        <Avatar src={article.author.avatar} size={20} alt={article.author.handle} />
                        <span className="text-medium leading-6 text-lightSecond">
                            {article.author.handle ?? formatEthereumAddress(article.author.id, 4)}
                        </span>
                        {data?.isCollected ? (
                            <CollectFillIcon width={16} height={16} className="ml-auto mr-1.5" />
                        ) : null}
                    </div>
                ) : null}
                <div className="mt-1.5 flex gap-2 text-center text-base">
                    <div className="flex-1 rounded-lg bg-lightBg p-2.5">
                        <span className="text-second">
                            <Trans>Collected</Trans>
                        </span>
                        <span className="mt-2 block text-main">
                            {nFormatter(data?.soldCount || 0)}
                            {data?.quantity ? `/${nFormatter(data.quantity)}` : null}
                        </span>
                    </div>
                    <div className="flex-1 rounded-lg bg-lightBg p-2.5">
                        <span className="text-second">
                            <Trans>Standard</Trans>
                        </span>
                        <span className="mt-2 block text-main">ERC721</span>
                    </div>
                </div>
            </div>

            {panelData ? (
                <MintParamsPanel
                    mintParams={panelData}
                    className="mt-6"
                    isLoading={false}
                    gasFee={result?.gasFee || '0'}
                    mintCount={1}
                    priceLabel={<Trans>Collect Price</Trans>}
                />
            ) : null}

            <ChainGuardButton
                targetChainId={data?.chainId}
                className={classNames(
                    'mt-6 inline-flex w-full gap-1 max-md:mt-4',
                    disabled ? 'cursor-not-allowed opacity-50' : '',
                )}
                loading={loading}
                onClick={disabled ? undefined : handleCollect}
            >
                {buttonText}
                {txUrl ? (
                    <LinkIcon
                        width={18}
                        height={18}
                        className="cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            openWindow(txUrl);
                        }}
                    />
                ) : null}
            </ChainGuardButton>
        </div>
    );
}
