import { SingletonModal } from '@/libs/SingletonModal.js';
import type { MessagePopoverProps } from '@/modals/FrameViewerModal/MessagePopover.jsx';

export const MessagePopoverRef = new SingletonModal<MessagePopoverProps>();
