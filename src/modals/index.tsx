'use client';

import { memo } from 'react';

import { AccountModal } from '@/modals/AccountModal.js';
import { ChainModal } from '@/modals/ChainModal.js';
import { ComposeModal } from '@/modals/ComposeModal.js';
import { ConfirmModal } from '@/modals/ConfirmModal.js';
import { ConnectWalletModal } from '@/modals/ConnectWalletModal.js';
import * as controls from '@/modals/controls.js';
import { DraggablePopover } from '@/modals/DraggablePopover.js';
import { FireflySessionConfirmModal } from '@/modals/FireflySessionConfirmModal.js';
import { LoginModal } from '@/modals/LoginModal.js';
import { LogoutModal } from '@/modals/LogoutModal.js';
import { SessionRecoveryModal } from '@/modals/SessionRecoveryModal.js';
import { Snackbar } from '@/modals/Snackbar.js';

export const Modals = memo(function Modals() {
    return (
        <>
            <AccountModal ref={controls.AccountModalRef.register} />
            <ChainModal ref={controls.ChainModalRef.register} />
            <ConnectWalletModal ref={controls.ConnectWalletModalRef.register} />
            <LoginModal ref={controls.LoginModalRef.register} />
            <LogoutModal ref={controls.LogoutModalRef.register} />
            <ComposeModal ref={controls.ComposeModalRef.register} />
            <ConfirmModal ref={controls.ConfirmModalRef.register} />
            <FireflySessionConfirmModal ref={controls.FireflySessionConfirmModalRef.register} />
            <DraggablePopover ref={controls.DraggablePopoverRef.register} />
            <Snackbar ref={controls.SnackbarRef.register} />
            <SessionRecoveryModal ref={controls.SessionRecoveryModalRef.register} />
        </>
    );
});
