import { t, Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { switchChain } from '@wagmi/core';
import { forwardRef, useMemo, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount, useChains } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import { Avatar } from '@/components/Avatar.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Modal } from '@/components/Modal.js';
import { config } from '@/configs/wagmiClient.js';
import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import { type SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { ConnectWalletModalRef } from '@/modals/controls.js';
import { MirrorAPI } from '@/providers/mirror/index.js';
import { ParagraphAPI } from '@/providers/paragraph/index.jsx';
import { type Article, ArticlePlatform } from '@/providers/types/Article.js';

export interface CollectArticleModalOpenProps {
    article: Article;
}

export const CollectArticleModal = forwardRef<SingletonModalRefCreator<CollectArticleModalOpenProps>>(
    function CollectArticleModal(_, ref) {
        const account = useAccount();
        const chains = useChains();

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

        const [{ loading: collectLoading }, handleCollect] = useAsyncFn(async () => {
            if (!data) return;
            if (!account.isConnected || !account.address) {
                ConnectWalletModalRef.open();
                return;
            }
            if (data.chainId && account.chainId !== data?.chainId) {
                await switchChain(config, { chainId: data.chainId });
            }

            switch (props?.article.platform) {
                case ArticlePlatform.Mirror:
                    return MirrorAPI.collect(data, account.address);
                case ArticlePlatform.Paragraph:
                    return ParagraphAPI.collect(data, account.address);
                default:
                    return;
            }
        }, [account, data]);

        const chain = chains.find((x) => x.id === data?.chainId);

        const buttonText = useMemo(() => {
            if (data?.chainId !== account.chainId) return t`Switch Chain`;
            if (data?.isCollected) return t`Collected`;

            if (!data?.price) return t`Free Collect`;
            return t`Collect for ${data.price} ${chain?.nativeCurrency.symbol}`;
        }, [data, account, chain]);

        const loading = queryDetailLoading || collectLoading;

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
                            disabled={loading || data?.isCollected}
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
