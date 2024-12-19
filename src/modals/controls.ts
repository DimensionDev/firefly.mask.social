import { SingletonModal } from '@/libs/SingletonModal.js';
import type { AddWalletModalCloseProps, AddWalletModalProps } from '@/modals/AddWalletModal.js';
import type { CollectArticleModalOpenProps } from '@/modals/CollectArticleModal.js';
import type { CollectPostModalOpenProps } from '@/modals/CollectPostModal.js';
import type { ComposeModalCloseProps, ComposeModalOpenProps } from '@/modals/ComposeModal.js';
import type { ConfirmFireflyModalCloseProps, ConfirmFireflyModalOpenProps } from '@/modals/ConfirmFireflyModal.js';
import type { ConfirmLeavingModalCloseProps, ConfirmLeavingModalOpenProps } from '@/modals/ConfirmLeavingModal.js';
import type { ConfirmModalCloseResult, ConfirmModalOpenProps } from '@/modals/ConfirmModal.js';
import type { DisconnectFireflyAccountModalProps } from '@/modals/DisconnectFireflyAccountModal.js';
import type { DraggablePopoverProps } from '@/modals/DraggablePopover.js';
import type { EditProfileModalOpenProps } from '@/modals/EditProfileModal.js';
import type { FreeMintModalOpenProps } from '@/modals/FreeMintModal/index.js';
import type { ImageEditorCloseProps, ImageEditorOpenProps } from '@/modals/ImageEditor/index.js';
import type { LoginModalOpenProps } from '@/modals/LoginModal/index.js';
import type { LogoutModalProps } from '@/modals/LogoutModal.js';
import type {
    NonFungibleCollectionSelectModalCloseProps,
    NonFungibleCollectionSelectModalOpenProps,
} from '@/modals/NonFungibleCollectionSelectModal/index.js';
import type { PreviewMediaModalOpenProps } from '@/modals/PreviewMediaModal.js';
import type { RedPacketModalOpenProps } from '@/modals/RedPacketModal/index.js';
import type { SchedulePostModalOpenProps } from '@/modals/SchedulePostModal.js';
import type { SnackbarCloseProps, SnackbarOpenProps } from '@/modals/Snackbar.js';
import type { SuperFollowModalOpenProps } from '@/modals/SuperFollowModal.js';
import type { TipsModalCloseProps, TipsModalOpenProps } from '@/modals/TipsModal.js';
import type { TokenSelectorModalCloseProps, TokenSelectorModalOpenProps } from '@/modals/TokenSelectorModal.js';
import type { TransactionSimulatorModalOpenProps } from '@/modals/TransactionSimulatorModal.js';

export const AccountModalRef = new SingletonModal();
export const ConnectModalRef = new SingletonModal();
export const ConnectWalletModalRef = new SingletonModal();
export const LoginModalRef = new SingletonModal<LoginModalOpenProps | void>();
export const LogoutModalRef = new SingletonModal<LogoutModalProps | void>();
export const ComposeModalRef = new SingletonModal<ComposeModalOpenProps, ComposeModalCloseProps>();
export const ConfirmModalRef = new SingletonModal<ConfirmModalOpenProps, ConfirmModalCloseResult>();
export const ConfirmFireflyModalRef = new SingletonModal<ConfirmFireflyModalOpenProps, ConfirmFireflyModalCloseProps>();
export const ConfirmLeavingModalRef = new SingletonModal<ConfirmLeavingModalOpenProps, ConfirmLeavingModalCloseProps>();
export const DraggablePopoverRef = new SingletonModal<DraggablePopoverProps>();
export const SnackbarRef = new SingletonModal<SnackbarOpenProps, SnackbarCloseProps>();
export const TipsModalRef = new SingletonModal<TipsModalOpenProps, TipsModalCloseProps>();
export const SolanaAccountModalRef = new SingletonModal();
export const PreviewMediaModalRef = new SingletonModal<PreviewMediaModalOpenProps>();
export const SchedulePostModalRef = new SingletonModal<SchedulePostModalOpenProps>();
export const EditProfileModalRef = new SingletonModal<EditProfileModalOpenProps>();
export const CollectArticleModalRef = new SingletonModal<CollectArticleModalOpenProps>();
export const EnableSignlessModalRef = new SingletonModal<void, boolean>();
export const CollectPostModalRef = new SingletonModal<CollectPostModalOpenProps>();
export const AddWalletModalRef = new SingletonModal<AddWalletModalProps, AddWalletModalCloseProps>();
export const SuperFollowModalRef = new SingletonModal<SuperFollowModalOpenProps>();
export const TransactionSimulatorModalRef = new SingletonModal<TransactionSimulatorModalOpenProps>();
export const DisconnectFireflyAccountModalRef = new SingletonModal<DisconnectFireflyAccountModalProps>();
export const TokenSelectorModalRef = new SingletonModal<TokenSelectorModalOpenProps, TokenSelectorModalCloseProps>();
export const RedPacketModalRef = new SingletonModal<RedPacketModalOpenProps | void>();
export const NonFungibleTokenCollectionSelectModalRef = new SingletonModal<
    NonFungibleCollectionSelectModalOpenProps,
    NonFungibleCollectionSelectModalCloseProps
>();
export const ImageEditorRef = new SingletonModal<ImageEditorOpenProps, ImageEditorCloseProps>();
export const FreeMintModalRef = new SingletonModal<FreeMintModalOpenProps>();
