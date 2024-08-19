import { EditProfileRouter } from '@/components/EditProfile/EditProfileRouter.js';
import { Modal } from '@/components/Modal.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function EditProfileDialog({
    profile,
    onClose,
    open,
}: {
    profile: Profile;
    onClose: () => void;
    open: boolean;
}) {
    return (
        <Modal open={open} onClose={onClose} className="flex-col" disableScrollLock={false} disableDialogClose>
            <div className="relative flex w-[100vw] flex-grow flex-col overflow-auto bg-lightBottom shadow-popover transition-all dark:bg-darkBottom dark:text-gray-950 md:h-auto md:max-h-[800px] md:w-[600px] md:rounded-xl lg:flex-grow-0">
                <EditProfileRouter onClose={onClose} profile={profile} />
            </div>
        </Modal>
    );
}
