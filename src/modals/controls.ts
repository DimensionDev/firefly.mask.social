import { SingletonModal } from '@masknet/shared-base';

import type { ComposeModalProps } from '@/modals/ComposeModal.js';
import type { LoginModalProps } from '@/modals/LoginModal.js';
import type { LogoutModalProps } from '@/modals/LogoutModal.js';
import type { PreviewImagesModalOpenProps } from '@/modals/PreviewImagesModal.js';
import type { ProfileStatusModalProps } from '@/modals/ProfileStatusModal.js';

export const AccountModalRef = new SingletonModal();
export const ConnectWalletModalRef = new SingletonModal();
export const ChainModalRef = new SingletonModal();
export const LoginModalRef = new SingletonModal<LoginModalProps | void>();
export const LogoutModalRef = new SingletonModal<LogoutModalProps | void>();
export const ProfileStatusModal = new SingletonModal<ProfileStatusModalProps>();
export const PreviewImageModalRef = new SingletonModal<PreviewImagesModalOpenProps>();
export const ComposeModalRef = new SingletonModal<ComposeModalProps>();
