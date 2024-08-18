import { Dialog } from '@headlessui/react';
import { Trans } from '@lingui/macro';

import { CloseButton } from '@/components/CloseButton.js';
import { EditProfileContent } from '@/components/EditProfile/EditProfileContent.js';
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
                <Dialog.Title as="h3" className="relative h-14 shrink-0 pt-safe">
                    <CloseButton className="absolute left-4 top-1/2 -translate-y-1/2 text-fourMain" onClick={onClose} />
                    <span className="flex h-full w-full items-center justify-center gap-x-1 text-lg font-bold capitalize text-fourMain">
                        <Trans>Edit Profile</Trans>
                    </span>
                </Dialog.Title>
                <EditProfileContent profile={profile} onUpdateProfile={onClose} />
            </div>
        </Modal>
    );
}
