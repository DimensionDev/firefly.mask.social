import {
    createOkxSwapWidget,
    type EthereumProvider,
    type IWidgetParams,
    type OkxEventListeners,
    OkxEvents,
    ProviderType,
} from '@okxweb3/dex-widget';
import { useAppKitProvider } from '@reown/appkit/react';
import { useEffect, useRef } from 'react';

import { Modal, type ModalProps } from '@/components/Modal.js';

interface Props extends ModalProps {}

export function SwapModal(props: Props) {
    const widgetRef = useRef<HTMLDivElement>(null);
    const appKitProvider = useAppKitProvider('eip155');
    const provider = appKitProvider.walletProvider as EthereumProvider;

    useEffect(() => {
        if (!widgetRef.current) return;
        const params: IWidgetParams = {
            width: 400,
            providerType: ProviderType.EVM,
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
        return () => {
            instance.destroy();
        };
    }, [provider]);

    return (
        <Modal {...props}>
            <div className="z-10 overflow-hidden rounded-lg border-line" ref={widgetRef} />
        </Modal>
    );
}
