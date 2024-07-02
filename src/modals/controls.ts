import { SingletonModal } from '@masknet/shared-base';

import type { DraggablePopoverProps } from '@/components/DraggablePopover.js';
import type { ComposeModalCloseProps, ComposeModalProps } from '@/modals/ComposeModal.js';
import type { ConfirmModalCloseProps, ConfirmModalOpenProps } from '@/modals/ConfirmModal.js';
import type {
    FireflySessionCloseConfirmModalProps,
    FireflySessionOpenConfirmModalProps,
} from '@/modals/FireflySessionConfirmModal.js';
import type { LoginModalProps } from '@/modals/LoginModal.js';
import type { LogoutModalProps } from '@/modals/LogoutModal.js';
import type { PreviewImagesModalOpenProps } from '@/modals/PreviewImagesModal.js';
import type { SnackbarCloseProps, SnackbarOpenProps } from '@/modals/Snackbar.js';

export const AccountModalRef = new SingletonModal();
export const ConnectWalletModalRef = new SingletonModal();
export const ChainModalRef = new SingletonModal();
export const SessionRecoveryModalRef = new SingletonModal();
export const LoginModalRef = new SingletonModal<LoginModalProps | void>();
export const PreviewImageModalRef = new SingletonModal<PreviewImagesModalOpenProps>();
export const LogoutModalRef = new SingletonModal<LogoutModalProps | void>();
export const ComposeModalRef = new SingletonModal<ComposeModalProps, ComposeModalCloseProps>();
export const ConfirmModalRef = new SingletonModal<ConfirmModalOpenProps, ConfirmModalCloseProps>();
export const FireflySessionConfirmModalRef = new SingletonModal<
    FireflySessionOpenConfirmModalProps,
    FireflySessionCloseConfirmModalProps
>();
export const DraggablePopoverRef = new SingletonModal<DraggablePopoverProps>();
export const SnackbarRef = new SingletonModal<SnackbarOpenProps, SnackbarCloseProps>();
export const SolanaAccountModalRef = new SingletonModal();
