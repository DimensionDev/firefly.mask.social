import { Appearance } from '@masknet/public-api';
import { ChainId, isNativeTokenAddress } from '@masknet/web3-shared-evm';
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

import { Modal, type ModalProps } from '@/components/Modal.js';
import { LangMap } from '@/constants/okx.js';
import { NATIVE_TOKEN_ADDRESS } from '@/providers/okx/constant.js';
import { toOkxNativeAddress } from '@/providers/okx/helper.js';
import { useLocale } from '@/store/useLocale.js';
import { useThemeModeStore } from '@/store/useThemeModeStore.js';

interface Props extends ModalProps {
    chainId: ChainId;
    address: string;
}

export function SwapModal({ chainId, address, ...rest }: Props) {
    const widgetRef = useRef<HTMLDivElement>(null);
    const appKitProvider = useAppKitProvider('eip155');
    const provider = appKitProvider.walletProvider as EthereumProvider;

    const locale = useLocale();
    const mode = useThemeModeStore.use.themeMode();
    const instanceRef = useRef<OkxSwapWidgetHandler | undefined>();

    const theme = mode === Appearance.default ? undefined : mode === Appearance.dark ? THEME.DARK : THEME.LIGHT;
    useEffect(() => {
        if (!widgetRef.current) return;

        const tokenPair = isNativeTokenAddress(address)
            ? {
                  fromChain: chainId,
                  toChain: chainId,
                  fromToken: toOkxNativeAddress(address),
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
    }, [address, chainId, locale, mode, provider, theme]);

    return (
        <Modal {...rest}>
            <div className="z-10 overflow-hidden rounded-2xl border-line" ref={widgetRef} />
        </Modal>
    );
}
