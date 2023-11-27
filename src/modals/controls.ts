import { SingletonModal } from '@masknet/shared-base';

import type { PreviewImagesModalOpenProps } from './PreviewImagesModal.js';

export const LoginModalRef = new SingletonModal();
export const LensStatusModalRef = new SingletonModal();
export const FarcasterStatusModalRef = new SingletonModal();
export const PreviewImageModalRef = new SingletonModal<PreviewImagesModalOpenProps>();
