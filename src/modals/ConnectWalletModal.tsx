import { Trans } from '@lingui/macro';
import { useNetworkDescriptor } from '@masknet/web3-hooks-base';
import { ChainId as EVMChainId } from '@masknet/web3-shared-evm';
import { ChainId as SolanaChainId } from '@masknet/web3-shared-solana';
import { useWalletModal as useConnectModalSolana } from '@solana/wallet-adapter-react-ui';
import { forwardRef, memo, type ReactNode } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Image } from '@/components/Image.js';
import { Modal } from '@/components/Modal.js';
import { Popover } from '@/components/Popover.js';
import { NetworkPluginID } from '@/constants/enum.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import { type SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { ConnectModalRef } from '@/modals/controls.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';

interface ConnectWalletModalUIProps {
    onOpenEvmDialog: () => void;
    onOpenSolanaDialog: () => void;
    title?: ReactNode;
    open: boolean;
    onClose: () => void;
    loading?: boolean;
}

export const ConnectWalletModalUI = memo<ConnectWalletModalUIProps>(function ConnectWalletModal({
    title,
    onOpenEvmDialog,
    onOpenSolanaDialog,
    open,
    onClose,
    loading,
}) {
    const isMedium = useIsMedium();

    const evmNetworkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, EVMChainId.Mainnet);
    const solanaNetworkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_SOLANA, SolanaChainId.Mainnet);

    const content = loading ? (
        <div className="flex h-[156px] items-center justify-center">
            <LoadingIcon className="animate-spin" width={24} height={24} />
        </div>
    ) : (
        <div className="grid grid-cols-1 gap-3 p-4 text-sm font-bold leading-5 text-second md:grid-cols-2">
            {[
                {
                    icon: evmNetworkDescriptor?.icon,
                    label: <Trans>EVM</Trans>,
                    onOpen: onOpenEvmDialog,
                    type: 'EVM',
                },
                {
                    icon: solanaNetworkDescriptor?.icon,
                    label: <Trans>Solana</Trans>,
                    onOpen: onOpenSolanaDialog,
                    type: 'Solana',
                },
            ].map((chainType) => {
                return (
                    <ClickableButton
                        key={chainType.type}
                        className="flex flex-col items-center gap-2 rounded-md px-4 py-6 hover:bg-lightBg hover:text-main"
                        onClick={() => {
                            chainType.onOpen();
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
                        {title ?? <Trans>Connect Wallet</Trans>}
                    </div>
                </div>
                {content}
            </div>
        </Modal>
    );
});

export const ConnectWalletModal = forwardRef<SingletonModalRefCreator>(function ConnectWalletModal(_, ref) {
    const connectModalSolana = useConnectModalSolana();
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen() {
            useNavigatorState.getState().updateSidebarOpen(false);
        },
    });

    return (
        <ConnectWalletModalUI
            onOpenSolanaDialog={() => {
                connectModalSolana.setVisible(true);
                dispatch?.close();
            }}
            onOpenEvmDialog={() => {
                ConnectModalRef.open();
                dispatch?.close();
            }}
            open={open}
            onClose={() => dispatch?.close()}
        />
    );
});
