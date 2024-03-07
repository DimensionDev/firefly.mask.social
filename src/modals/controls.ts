import { SingletonModal } from '@masknet/shared-base';

import type { ComposeModalCloseProps, ComposeModalProps } from '@/modals/ComposeModal.js';
import type { ConfirmModalCloseProps, ConfirmModalOpenProps } from '@/modals/ConfirmModal.js';
import type { DiscardModalProps } from '@/modals/DiscardModal.js';
import type { LoginModalProps } from '@/modals/LoginModal.js';
import type { LogoutModalProps } from '@/modals/LogoutModal.js';
import type { PreviewImagesModalOpenProps } from '@/modals/PreviewImagesModal.js';
import type { ProfileStatusModalProps } from '@/modals/ProfileStatusModal.js';

export const AccountModalRef = new SingletonModal();
export const ConnectWalletModalRef = new SingletonModal();
export const ChainModalRef = new SingletonModal();
export const LoginModalRef = new SingletonModal<LoginModalProps | void>();
export const LogoutModalRef = new SingletonModal<LogoutModalProps | void>();
export const PreviewImageModalRef = new SingletonModal<PreviewImagesModalOpenProps>();
export const ComposeModalRef = new SingletonModal<ComposeModalProps, ComposeModalCloseProps>();
export const DiscardModalRef = new SingletonModal<DiscardModalProps>();
export const ConfirmModalRef = new SingletonModal<ConfirmModalOpenProps, ConfirmModalCloseProps>();
