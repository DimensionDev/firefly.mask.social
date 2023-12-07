import { SingletonModal } from '@masknet/shared-base';

import type { ComposeModalProps } from '@/modals/ComposeModal.js';
import type { LoginModalProps } from '@/modals/LoginModal.js';
import type { LogoutModalProps } from '@/modals/LogoutModal.js';

import type { PreviewImagesModalOpenProps } from './PreviewImagesModal.js';

export const LoginModalRef = new SingletonModal<LoginModalProps>();
export const LensStatusModalRef = new SingletonModal();
export const FarcasterStatusModalRef = new SingletonModal();
export const LogoutModalRef = new SingletonModal<LogoutModalProps>();
export const PreviewImageModalRef = new SingletonModal<PreviewImagesModalOpenProps>();
export const ComposeModalRef = new SingletonModal<ComposeModalProps>();
