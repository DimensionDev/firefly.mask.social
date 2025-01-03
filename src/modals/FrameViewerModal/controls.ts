import { SingletonModal } from '@/libs/SingletonModal.js';
import type { TransactionSimulationPopoverProps } from '@/modals/FrameViewerModal/TransactionSimulationPopover.js';

export const TransactionSimulationPopoverRef = new SingletonModal<TransactionSimulationPopoverProps, boolean>();
