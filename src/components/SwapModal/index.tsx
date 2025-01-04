import { ChainId, isNativeTokenAddress, isZeroAddress } from '@masknet/web3-shared-evm';
import {
    createOkxSwapWidget,
    type EthereumProvider,
    type IWidgetParams,
    type OkxEventListeners,
    OkxEvents,
    type OkxSwapWidgetHandler,
    ProviderType,
    THEME,
    TradeType,
} from '@okxweb3/dex-widget';
import { useAppKitProvider } from '@reown/appkit/react';
import { useEffect, useRef } from 'react';
import { useMediaQuery } from 'usehooks-ts';

import { CloseButton } from '@/components/IconButton.js';
import { Modal, type ModalProps } from '@/components/Modal.js';
import { Locale } from '@/constants/enum.js';
import { NATIVE_TOKEN_ADDRESS } from '@/constants/okx.js';
import { useLocale } from '@/store/useLocale.js';
import { useThemeModeStore } from '@/store/useThemeModeStore.js';

const LangMap = {
    [Locale.en]: 'en_us',
    [Locale.zhHans]: 'zh_cn',
    [Locale.zhHant]: 'zh_tw',
};

interface Props extends ModalProps {
    chainId: ChainId;
    chainIds: number[];
    address: string;
}

export function SwapModal({ chainId, chainIds, address, ...rest }: Props) {
    const widgetRef = useRef<HTMLDivElement>(null);
    const appKitProvider = useAppKitProvider('eip155');
    const provider = appKitProvider.walletProvider as EthereumProvider;

    const locale = useLocale();
    const mode = useThemeModeStore.use.themeMode();
    const instanceRef = useRef<OkxSwapWidgetHandler | undefined>(undefined);

    const isDark = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = isDark || mode === 'dark' ? THEME.DARK : THEME.LIGHT;
    useEffect(() => {
        if (!widgetRef.current) return;

        const tokenPair = isNativeTokenAddress(address)
            ? {
                  fromChain: chainId,
                  toChain: chainId,
                  fromToken: isZeroAddress(address) ? NATIVE_TOKEN_ADDRESS : address,
              }
            : {
                  fromChain: chainId,
                  toChain: chainId,
                  fromToken: NATIVE_TOKEN_ADDRESS,
                  toToken: address,
              };
        const params: IWidgetParams = {
            tradeType: TradeType.SWAP,
            lang: LangMap[locale] || 'en_us',
            theme,
            width: 400,
            providerType: ProviderType.EVM,
            chainIds: chainIds.map((x) => x.toString()),
            tokenPair,
        };

        const listeners: OkxEventListeners = [
            {
                event: OkxEvents.ON_CONNECT_WALLET,
                handler: () => {
                    provider.enable();
                },
            },
        ];

        const instance = createOkxSwapWidget(widgetRef.current, {
            params,
            provider,
            listeners,
        });
        instanceRef.current = instance;
        return () => {
            instance.destroy();
            instanceRef.current = undefined;
        };
    }, [address, chainId, chainIds, locale, mode, provider, theme]);

    return (
        <Modal {...rest}>
            <div className="relative z-10 overflow-hidden rounded-2xl border-line bg-white pt-2 dark:bg-black">
                <CloseButton
                    className="absolute left-1 top-1 text-main"
                    onClick={() => {
                        rest.onClose();
                    }}
                />
                <div ref={widgetRef} />
            </div>
        </Modal>
    );
}
