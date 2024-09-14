import { forwardRef, useCallback, useState } from 'react';

import { Modal } from '@/components/Modal.js';
import { SuperFollow } from '@/components/Posts/SuperFollow.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export interface SuperFollowModalOpenProps {
    profile: Profile;
}

export const SuperFollowModal = forwardRef<SingletonModalRefCreator<SuperFollowModalOpenProps>>(
    function SuperFollowModal(_, ref) {
        const [props, setProps] = useState<SuperFollowModalOpenProps>();

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: (props) => setProps(props),
            onClose: () => setProps(undefined),
        });

        const onClose = useCallback(() => dispatch?.close(), [dispatch]);

        if (!props) return null;

        return (
            <Modal open={open} onClose={onClose}>
                <div className="w-[485px] max-w-[90vw] transform rounded-xl bg-primaryBottom p-6 transition-all">
                    <SuperFollow profile={props.profile} onClose={onClose} />
                </div>
            </Modal>
        );
    },
);
