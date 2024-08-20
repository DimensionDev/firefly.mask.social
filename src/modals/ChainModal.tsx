import { safeUnreachable } from '@masknet/kit';
import { useChainModal } from '@rainbow-me/rainbowkit';
import { useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react';
import { forwardRef } from 'react';

import { WalletProviderType } from '@/constants/enum.js';
import { useWalletModal } from '@/hooks/useWalletModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { useDeveloperSettingsState } from '@/store/useDeveloperSettingsStore.js';

export const ChainModal = forwardRef<SingletonModalRefCreator>(function ChainModal(_, ref) {
    const providerType = useDeveloperSettingsState.use.providerType();

    const { openChainModal, chainModalOpen } = useChainModal();

    const { open: opened } = useWeb3ModalState();
    const { open } = useWeb3Modal();

    const openModal = () => {
        switch (providerType) {
            case WalletProviderType.AppKit:
                open({
                    view: 'Networks',
                });
                break;
            case WalletProviderType.RainbowKit:
                openChainModal?.();
                break;
            default:
                safeUnreachable(providerType);
                break;
        }
    };

    const getModalOpened = () => {
        switch (providerType) {
            case WalletProviderType.AppKit:
                return opened;
            case WalletProviderType.RainbowKit:
                return chainModalOpen;
            default:
                safeUnreachable(providerType);
                return false;
        }
    };

    useWalletModal(openModal, getModalOpened(), ref);

    return null;
});
