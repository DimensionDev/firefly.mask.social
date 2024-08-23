import { safeUnreachable } from '@masknet/kit';
import { useAccountModal } from '@rainbow-me/rainbowkit';
import { useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react';
import { forwardRef } from 'react';

import { WalletProviderType } from '@/constants/enum.js';
import { useWalletModal } from '@/hooks/useWalletModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { useDeveloperSettingsState } from '@/store/useDeveloperSettingsStore.js';

export const AccountModal = forwardRef<SingletonModalRefCreator>(function AccountModal(_, ref) {
    const providerType = useDeveloperSettingsState.use.providerType();

    const { openAccountModal, accountModalOpen } = useAccountModal();

    const { open: opened } = useWeb3ModalState();
    const { open } = useWeb3Modal();

    const openModal = () => {
        switch (providerType) {
            case WalletProviderType.AppKit:
                open({
                    view: 'Account',
                });
                break;
            case WalletProviderType.RainbowKit:
                openAccountModal?.();
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
                return accountModalOpen;
            default:
                safeUnreachable(providerType);
                return false;
        }
    };

    useWalletModal(openModal, getModalOpened(), ref);

    return null;
});
