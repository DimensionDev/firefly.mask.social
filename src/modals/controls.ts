import { SingletonModal } from '@masknet/shared-base';

import type { LoginModalProps } from '@/modals/LoginModal.js';
import type { LogoutModalProps } from '@/modals/LogoutModal.js';

export const LoginModalRef = new SingletonModal<LoginModalProps>();
export const LensStatusModalRef = new SingletonModal();
export const FarcasterStatusModalRef = new SingletonModal();
export const LogoutModalRef = new SingletonModal<LogoutModalProps>();
