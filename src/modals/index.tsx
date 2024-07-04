'use client';

import { memo } from 'react';

import { SolanaAccountModal } from '@/components/SolanaAccountModal.js';
import { AccountModal } from '@/modals/AccountModal.js';
import { AccountsConfirmModal } from '@/modals/AccountsConfirmModal.js';
import { ChainModal } from '@/modals/ChainModal.js';
import { ComposeModal } from '@/modals/ComposeModal.js';
import { ConfirmModal } from '@/modals/ConfirmModal.js';
import { ConnectWalletModal } from '@/modals/ConnectWalletModal.js';
import * as controls from '@/modals/controls.js';
import { DraggablePopover } from '@/modals/DraggablePopover.js';
import { LoginModal } from '@/modals/LoginModal.js';
import { LogoutModal } from '@/modals/LogoutModal.js';
import { PreviewImagesModal } from '@/modals/PreviewImagesModal.js';
import { RainbowKitConnectModal } from '@/modals/RainbowKitConnectModal.js';
import { Snackbar } from '@/modals/Snackbar.js';

export const Modals = memo(function Modals() {
    return (
        <>
            <AccountModal ref={controls.AccountModalRef.register} />
            <RainbowKitConnectModal ref={controls.RainbowKitModalRef.register} />
            <ChainModal ref={controls.ChainModalRef.register} />
            <ConnectWalletModal ref={controls.ConnectWalletModalRef.register} />
            <SolanaAccountModal ref={controls.SolanaAccountModalRef.register} />
            <LoginModal ref={controls.LoginModalRef.register} />
            <LogoutModal ref={controls.LogoutModalRef.register} />
            <PreviewImagesModal ref={controls.PreviewImageModalRef.register} />
            <ComposeModal ref={controls.ComposeModalRef.register} />
            <ConfirmModal ref={controls.ConfirmModalRef.register} />
            <AccountsConfirmModal ref={controls.AccountsConfirmModalRef.register} />
            <DraggablePopover ref={controls.DraggablePopoverRef.register} />
            <Snackbar ref={controls.SnackbarRef.register} />
        </>
    );
});
