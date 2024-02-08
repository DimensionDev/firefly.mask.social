'use client';

import { memo } from 'react';

import { AccountModal } from '@/modals/AccountModal.js';
import { ChainModal } from '@/modals/ChainModal.js';
import { ComposeModal } from '@/modals/ComposeModal.js';
import { ConfirmModal } from '@/modals/ConfirmModal.js';
import { ConnectWalletModal } from '@/modals/ConnectWalletModal.js';
import * as controls from '@/modals/controls.js';
import { LoginModal } from '@/modals/LoginModal.js';
import { LogoutModal } from '@/modals/LogoutModal.js';
import { PreviewImagesModal } from '@/modals/PreviewImagesModal.js';
import { ProfileStatusModal } from '@/modals/ProfileStatusModal.js';

export const Modals = memo(function Modals() {
    return (
        <>
            <AccountModal ref={controls.AccountModalRef.register} />
            <ChainModal ref={controls.ChainModalRef.register} />
            <ConnectWalletModal ref={controls.ConnectWalletModalRef.register} />
            <LoginModal ref={controls.LoginModalRef.register} />
            <ProfileStatusModal ref={controls.ProfileStatusModal.register} />
            <LogoutModal ref={controls.LogoutModalRef.register} />
            <PreviewImagesModal ref={controls.PreviewImageModalRef.register} />
            <ComposeModal ref={controls.ComposeModalRef.register} />
            <ConfirmModal ref={controls.ConfirmModalRef.register} />
        </>
    );
});
