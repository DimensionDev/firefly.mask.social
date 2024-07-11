import { Trans } from '@lingui/macro';
import { useNetworkDescriptor } from '@masknet/web3-hooks-base';
import { useConnectModal as useConnectModalEVM } from '@rainbow-me/rainbowkit';
import { useWalletModal as useConnectModalSolana } from '@solana/wallet-adapter-react-ui';
import { forwardRef } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Image } from '@/components/Image.js';
import { Modal } from '@/components/Modal.js';
import { Popover } from '@/components/Popover.js';
import { NetworkPluginID } from '@/constants/enum.js';
import { ChainId as EVMChainId } from '@/constants/ethereum.js';
import { ChainId as SolanaChainId } from '@/constants/solana.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import { type SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';

export const ConnectWalletModal = forwardRef<SingletonModalRefCreator>(function ConnectWalletModal(_, ref) {
    const isMedium = useIsMedium();

    const connectModalEVM = useConnectModalEVM();
    const connectModalSolana = useConnectModalSolana();
    const evmNetworkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, EVMChainId.Mainnet);
    const solanaNetworkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_SOLANA, SolanaChainId.Mainnet);

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen() {
            useNavigatorState.getState().updateSidebarOpen(false);
        },
    });

    function onClose() {
        dispatch?.close();
    }

    const content = (
        <div className="grid grid-cols-1 gap-3 p-4 text-sm font-bold leading-5 text-second md:grid-cols-2">
            {[
                {
                    icon: evmNetworkDescriptor?.icon,
                    label: <Trans>EVM</Trans>,
                    onOpen: () => connectModalEVM.openConnectModal?.(),
                    type: 'EVM',
                },
                {
                    icon: solanaNetworkDescriptor?.icon,
                    label: <Trans>Solana</Trans>,
                    onOpen: () => connectModalSolana.setVisible(true),
                    type: 'Solana',
                },
            ].map((chainType) => {
                return (
                    <ClickableButton
                        key={chainType.type}
                        className="flex flex-col items-center gap-2 rounded-md px-4 py-6 hover:bg-lightBg hover:text-main"
                        onClick={() => {
                            chainType.onOpen();
                            onClose();
                        }}
                    >
                        <Image
                            src={chainType.icon ?? ''}
                            width={48}
                            height={48}
                            alt={chainType.type}
                            className="h-12 w-12"
                        />
                        <span>{chainType.label}</span>
                    </ClickableButton>
                );
            })}
        </div>
    );

    if (!isMedium) {
        return (
            <Popover open={open} onClose={onClose}>
                {content}
            </Popover>
        );
    }

    return (
        <Modal open={open} onClose={onClose}>
            <div className="transform rounded-[12px] bg-primaryBottom transition-all">
                <div
                    className="relative inline-flex items-center justify-center gap-2 rounded-t-[12px] p-4 text-center md:h-[56px] md:w-[600px]"
                    style={{ background: 'var(--m-modal-title-bg)' }}
                >
                    <CloseButton onClick={onClose} className="absolute left-4 top-4" />
                    <div className="text-lg font-bold leading-6 text-main">
                        <Trans>Connect Wallet</Trans>
                    </div>
                </div>
                {content}
            </div>
        </Modal>
    );
});
