import { forwardRef, useState } from 'react';

import { Modal } from '@/components/Modal.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export interface EditProfileModalOpenProps {
    profile: Profile;
}

export const EditProfileModal = forwardRef<SingletonModalRefCreator<EditProfileModalOpenProps>>(
    function EditProfileModal(_, ref) {
        const [props, setProps] = useState<EditProfileModalOpenProps>();

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: (props) => setProps(props),
            onClose: () => setProps(undefined),
        });

        if (!props) return null;

        return (
            <Modal open={open} onClose={() => dispatch?.close()}>
                <div>TODO: Edit Profile</div>
            </Modal>
        );
    },
);
