import { Trans } from '@lingui/macro';
import { NetworkPluginID, type SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { useNetworkDescriptor } from '@masknet/web3-hooks-base';
import { ChainId as EVMChainId } from '@masknet/web3-shared-evm';
import { ChainId as SolanaChainId } from '@masknet/web3-shared-solana';
import { useConnectModal as useConnectModalEVM } from '@rainbow-me/rainbowkit';
import { useWalletModal as useConnectModalSolana } from '@solana/wallet-adapter-react-ui';
import { forwardRef } from 'react';

import { CloseButton } from '@/components/CloseButton.js';
import { Image } from '@/components/Image.js';
import { Modal } from '@/components/Modal.js';
import { Popover } from '@/components/Popover.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

export const ConnectWalletModal = forwardRef<SingletonModalRefCreator>(function ConnectWalletModal(_, ref) {
    const connectModalEVM = useConnectModalEVM();
    const connectModalSolana = useConnectModalSolana();
    const evmNetworkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, EVMChainId.Mainnet);
    const solanaNetworkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_SOLANA, SolanaChainId.Mainnet);

    const [open, dispatch] = useSingletonModal(ref, {});

    const isMedium = useIsMedium();

    function onClose() {
        dispatch?.close();
    }

    const chainTypes = [
        {
            icon: evmNetworkDescriptor?.icon,
            label: <Trans>EVM</Trans>,
            onOpen: () => connectModalEVM.openConnectModal?.(),
        },
        {
            icon: solanaNetworkDescriptor?.icon,
            label: <Trans>Solana</Trans>,
            onOpen: () => connectModalSolana.setVisible(true),
        },
    ];

    const content = (
        <div className="grid grid-cols-1 gap-3 p-4 text-sm font-bold leading-5 text-second md:grid-cols-2">
            {chainTypes.map((chainType) => {
                return (
                    <button
                        className="flex flex-col items-center gap-2 rounded-md px-4 py-6 hover:bg-lightBg hover:text-main"
                        onClick={() => {
                            chainType.onOpen();
                            onClose();
                        }}
                    >
                        <Image src={chainType.icon ?? ''} width={48} height={48} alt="evm" className="h-12 w-12" />
                        <div>{chainType.label}</div>
                    </button>
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
                    <CloseButton onClick={() => dispatch?.close()} className="absolute left-4 top-4" />
                    <div className="text-lg font-bold leading-6 text-main">
                        <Trans>Connect Wallet</Trans>
                    </div>
                </div>
                {content}
            </div>
        </Modal>
    );
});
