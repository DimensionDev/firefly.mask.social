import { t, Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { readContract, switchChain, writeContract } from '@wagmi/core';
import { forwardRef, useMemo, useState } from 'react';
import { useAsync, useAsyncFn } from 'react-use';
import { zeroAddress } from 'viem';
import { polygon } from 'viem/chains';
import { useAccount, useChains, usePublicClient } from 'wagmi';

import { MirrorABI } from '@/abis/Mirror.js';
import LoadingIcon from '@/assets/loading.svg';
import { Avatar } from '@/components/Avatar.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Modal } from '@/components/Modal.js';
import { config } from '@/configs/wagmiClient.js';
import { MIRROR_COLLECT_FEE, MIRROR_COLLECT_FEE_IN_POLYGON } from '@/constants/index.js';
import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import { type SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { ConnectWalletModalRef } from '@/modals/controls.js';
import { MirrorAPI } from '@/providers/mirror/index.js';
import { type Article, ArticlePlatform } from '@/providers/types/Article.js';

export interface CollectArticleModalOpenProps {
    article: Article;
}

export const CollectArticleModal = forwardRef<SingletonModalRefCreator<CollectArticleModalOpenProps>>(
    function CollectArticleModal(_, ref) {
        const account = useAccount();
        const chains = useChains();
        const client = usePublicClient();

        const [props, setProps] = useState<CollectArticleModalOpenProps>();
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: (props) => {
                setProps({
                    article: props.article,
                });
            },
            onClose: () => {},
        });

        const { data, isLoading: queryDetailLoading } = useQuery({
            enabled: !!props?.article && open,
            queryKey: ['article', props?.article.platform, props?.article.id],
            queryFn: async () => {
                if (!props?.article) return;
                switch (props.article.platform) {
                    case ArticlePlatform.Mirror:
                        return MirrorAPI.getArticleDetail(props.article.id);
                    case ArticlePlatform.Paragraph:
                    default:
                        return;
                }
            },
        });

        // TODO: paragraph
        const { value: isCollected, loading: queryCollectedLoading } = useAsync(async () => {
            try {
                if (!data?.proxyAddress || !account.address || !props?.article.platform) return;

                const result = await readContract(config, {
                    abi: MirrorABI,
                    address: data.proxyAddress as `0x${string}`,
                    functionName: 'balanceOf',
                    args: [account.address],
                    chainId: data.chainId,
                });

                if (BigInt(result as bigint) >= 1) return true;
                return false;
            } catch {
                return false;
            }
        }, [data?.proxyAddress, account.address, props?.article.platform, data?.chainId]);

        const [{ loading: collectLoading }, handleCollect] = useAsyncFn(async () => {
            if (!account.isConnected) {
                ConnectWalletModalRef.open();
                return;
            }
            if (data?.chainId && account.chainId !== data?.chainId) {
                await switchChain(config, { chainId: data.chainId });
            }

            await writeContract(config, {
                abi: MirrorABI,
                address: (data?.proxyAddress || data?.factorAddress) as `0x${string}`,
                functionName: 'purchase',
                args: [account.address, '', zeroAddress],
                // https://support.mirror.xyz/hc/en-us/articles/13729399363220-Platform-fees
                value: data?.chainId !== polygon.id ? MIRROR_COLLECT_FEE : MIRROR_COLLECT_FEE_IN_POLYGON,
            });
        }, [account, data]);

        const buttonText = useMemo(() => {
            if (data?.chainId !== account.chainId) return t`Switch Chain`;
            if (isCollected) return t`Collected`;

            if (!data?.price) return t`Free Collect`;
            // TODO: symbol
            return t`Collect for ${data.price}`;
        }, [isCollected, data, account]);

        const chain = chains.find((x) => x.id === data?.chainId);
        const loading = queryDetailLoading || queryCollectedLoading || collectLoading;
        return (
            <Modal onClose={() => dispatch?.close()} open={open}>
                <div
                    className="relative w-[432px] max-w-[90vw] rounded-xl bg-lightBottom shadow-popover transition-all dark:text-gray-950"
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                >
                    <div className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-t-[12px] p-4">
                        <div className="relative h-6 w-6" />
                        <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                            <Trans>Collect Article</Trans>
                        </div>

                        <CloseButton
                            onClick={() => {
                                dispatch?.close();
                            }}
                        />
                    </div>

                    <div className="px-6 pb-6">
                        <div className="my-3 rounded-lg bg-lightBg px-3 py-2">
                            <div className="line-clamp-2 break-keep text-left text-base font-bold leading-5 text-fourMain">
                                {props?.article.title}
                            </div>
                            {props?.article.author ? (
                                <div className="mt-[6px] flex items-center gap-2">
                                    <Avatar
                                        src={props.article.author.avatar}
                                        size={20}
                                        alt={props.article.author.handle}
                                    />
                                    <span className="text-[15px] leading-[24px] text-lightSecond">
                                        {props.article.author.handle ??
                                            formatEthereumAddress(props.article.author.id, 4)}
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex items-center justify-center gap-7 text-sm leading-[22px]">
                            <div className="flex flex-col items-center">
                                <div className="font-bold text-main">
                                    <span>{data?.soldNum}</span>
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

                        <ClickableButton
                            disabled={loading || isCollected}
                            onClick={handleCollect}
                            className="mt-3 flex h-10 w-full items-center justify-center rounded-[20px] bg-lightMain font-bold text-lightBottom dark:text-darkBottom"
                        >
                            {loading ? <LoadingIcon className="animate-spin" width={24} height={24} /> : buttonText}
                        </ClickableButton>
                    </div>
                </div>
            </Modal>
        );
    },
);
