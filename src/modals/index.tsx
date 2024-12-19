'use client';

import { memo } from 'react';

import { SolanaAccountModal } from '@/components/SolanaAccountModal.js';
import { AccountModal } from '@/modals/AccountModal.js';
import { AddWalletModal } from '@/modals/AddWalletModal.js';
import { CollectArticleModal } from '@/modals/CollectArticleModal.js';
import { CollectPostModal } from '@/modals/CollectPostModal.js';
import { ComposeModal } from '@/modals/ComposeModal.js';
import { ConfirmFireflyModal } from '@/modals/ConfirmFireflyModal.js';
import { ConfirmLeavingModal } from '@/modals/ConfirmLeavingModal.js';
import { ConfirmModal } from '@/modals/ConfirmModal.js';
import { ConnectModal } from '@/modals/ConnectModal.js';
import { ConnectWalletModal } from '@/modals/ConnectWalletModal.js';
import * as controls from '@/modals/controls.js';
import { DisconnectFireflyAccountModal } from '@/modals/DisconnectFireflyAccountModal.js';
import { DraggablePopover } from '@/modals/DraggablePopover.js';
import { EditProfileModal } from '@/modals/EditProfileModal.js';
import { EnableSignlessModal } from '@/modals/EnableSignlessModal.js';
import { FreeMintModal } from '@/modals/FreeMintModal/index.js';
import { ImageEditorModal } from '@/modals/ImageEditor/index.js';
import { LoginModal } from '@/modals/LoginModal/index.js';
import { LogoutModal } from '@/modals/LogoutModal.js';
import { NonFungibleCollectionSelectModal } from '@/modals/NonFungibleCollectionSelectModal/index.js';
import { PreviewMediaModal } from '@/modals/PreviewMediaModal.js';
import { RedPacketModal } from '@/modals/RedPacketModal/index.js';
import { SchedulePostModal } from '@/modals/SchedulePostModal.js';
import { Snackbar } from '@/modals/Snackbar.js';
import { SuperFollowModal } from '@/modals/SuperFollowModal.js';
import { TipsModal } from '@/modals/TipsModal.js';
import { TokenSelectorModal } from '@/modals/TokenSelectorModal.js';
import { TransactionSimulatorModal } from '@/modals/TransactionSimulatorModal.js';

export const Modals = memo(function Modals() {
    return (
        <>
            <AccountModal ref={controls.AccountModalRef.register} />
            <ConnectModal ref={controls.ConnectModalRef.register} />
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
            <EnableSignlessModal ref={controls.EnableSignlessModalRef.register} />
            <CollectPostModal ref={controls.CollectPostModalRef.register} />
            <AddWalletModal ref={controls.AddWalletModalRef.register} />
            <SuperFollowModal ref={controls.SuperFollowModalRef.register} />
            <TransactionSimulatorModal ref={controls.TransactionSimulatorModalRef.register} />
            <DisconnectFireflyAccountModal ref={controls.DisconnectFireflyAccountModalRef.register} />
            <TokenSelectorModal ref={controls.TokenSelectorModalRef.register} />
            <RedPacketModal ref={controls.RedPacketModalRef.register} />
            <NonFungibleCollectionSelectModal ref={controls.NonFungibleTokenCollectionSelectModalRef.register} />
            <ImageEditorModal ref={controls.ImageEditorRef.register} />
            <FreeMintModal ref={controls.FreeMintModalRef.register} />
        </>
    );
});
