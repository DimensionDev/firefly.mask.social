import { CZActivityRouter } from '@/components/ActivityPage/CZ/CZActivityRouter.js';
import { Modal } from '@/components/Modal.js';

interface Props {
    onClose: () => void;
    open: boolean;
}

export function CZActivityDialog({ open, onClose }: Props) {
    return (
        <Modal open={open} onClose={onClose} className="flex-col" disableScrollLock={false} disableDialogClose>
            <CZActivityRouter />
        </Modal>
    );
}
