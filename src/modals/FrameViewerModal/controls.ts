import { SingletonModal } from '@/libs/SingletonModal.js';
import type { ReviewTransactionPopoverProps } from '@/modals/FrameViewerModal/ReviewTransactionPopover.js';

export const ReviewTransactionPopoverRef = new SingletonModal<ReviewTransactionPopoverProps, boolean>();
