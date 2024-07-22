import { SingletonModal } from '@/libs/SingletonModal.js';
import type { ComposeModalCloseProps, ComposeModalProps } from '@/modals/ComposeModal.js';
import type {
    ConfirmBeforeLeavingModalCloseProps,
    ConfirmBeforeLeavingModalOpenProps,
} from '@/modals/ConfirmBeforeLeavingModal.js';
import type { ConfirmFireflyModalCloseProps, ConfirmFireflyModalOpenProps } from '@/modals/ConfirmFireflyModal.js';
import type { ConfirmModalCloseProps, ConfirmModalOpenProps } from '@/modals/ConfirmModal.js';
import type { DraggablePopoverProps } from '@/modals/DraggablePopover.js';
import type { EditProfileModalOpenProps } from '@/modals/EditProfileModal.js';
import type { LoginModalOpenProps } from '@/modals/LoginModal.js';
import type { LogoutModalProps } from '@/modals/LogoutModal.js';
import type { PreviewMediaModalOpenProps } from '@/modals/PreviewMediaModal.js';
import type { SchedulePostModalOpenProps } from '@/modals/SchedulePostModal.js';
import type { SnackbarCloseProps, SnackbarOpenProps } from '@/modals/Snackbar.js';
import type { TipsModalCloseProps, TipsModalOpenProps } from '@/modals/TipsModal.js';

export const AccountModalRef = new SingletonModal();
export const RainbowKitModalRef = new SingletonModal();
export const ConnectWalletModalRef = new SingletonModal();
export const ChainModalRef = new SingletonModal();
export const SessionRecoveryModalRef = new SingletonModal();
export const LoginModalRef = new SingletonModal<LoginModalOpenProps | void>();
export const LogoutModalRef = new SingletonModal<LogoutModalProps | void>();
export const ComposeModalRef = new SingletonModal<ComposeModalProps, ComposeModalCloseProps>();
export const ConfirmModalRef = new SingletonModal<ConfirmModalOpenProps, ConfirmModalCloseProps>();
export const ConfirmFireflyModalRef = new SingletonModal<ConfirmFireflyModalOpenProps, ConfirmFireflyModalCloseProps>();
export const ConfirmBeforeLeavingModalRef = new SingletonModal<
    ConfirmBeforeLeavingModalOpenProps,
    ConfirmBeforeLeavingModalCloseProps
>();
export const DraggablePopoverRef = new SingletonModal<DraggablePopoverProps>();
export const SnackbarRef = new SingletonModal<SnackbarOpenProps, SnackbarCloseProps>();
export const TipsModalRef = new SingletonModal<TipsModalOpenProps, TipsModalCloseProps>();
export const SolanaAccountModalRef = new SingletonModal();
export const PreviewMediaModalRef = new SingletonModal<PreviewMediaModalOpenProps>();
export const SchedulePostModalRef = new SingletonModal<SchedulePostModalOpenProps>();
export const EditProfileModalRef = new SingletonModal<EditProfileModalOpenProps>();
