'use client';

import { memo } from 'react';

import { SolanaAccountModal } from '@/components/SolanaAccountModal.js';
import { AccountModal } from '@/modals/AccountModal.js';
import { ChainModal } from '@/modals/ChainModal.js';
import { CollectArticleModal } from '@/modals/CollectArticleModal.js';
import { ComposeModal } from '@/modals/ComposeModal.js';
import { ConfirmFireflyModal } from '@/modals/ConfirmFireflyModal.js';
import { ConfirmLeavingModal } from '@/modals/ConfirmLeavingModal.js';
import { ConfirmModal } from '@/modals/ConfirmModal.js';
import { ConnectWalletModal } from '@/modals/ConnectWalletModal.js';
import * as controls from '@/modals/controls.js';
import { DraggablePopover } from '@/modals/DraggablePopover.js';
import { EditProfileModal } from '@/modals/EditProfileModal.js';
import { LoginModal } from '@/modals/LoginModal/index.js';
import { LogoutModal } from '@/modals/LogoutModal.js';
import { PreviewMediaModal } from '@/modals/PreviewMediaModal.js';
import { RainbowKitConnectModal } from '@/modals/RainbowKitConnectModal.js';
import { SchedulePostModal } from '@/modals/SchedulePostModal.js';
import { Snackbar } from '@/modals/Snackbar.js';
import { TipsModal } from '@/modals/TipsModal.js';

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
            <ComposeModal ref={controls.ComposeModalRef.register} />
            <ConfirmModal ref={controls.ConfirmModalRef.register} />
            <ConfirmFireflyModal ref={controls.ConfirmFireflyModalRef.register} />
            <ConfirmLeavingModal ref={controls.ConfirmLeavingModalRef.register} />
            <DraggablePopover ref={controls.DraggablePopoverRef.register} />
            <Snackbar ref={controls.SnackbarRef.register} />
            <TipsModal ref={controls.TipsModalRef.register} />
            <PreviewMediaModal ref={controls.PreviewMediaModalRef.register} />
            <SchedulePostModal ref={controls.SchedulePostModalRef.register} />
            <EditProfileModal ref={controls.EditProfileModalRef.register} />
            <CollectArticleModal ref={controls.CollectArticleModalRef.register} />
        </>
    );
});
