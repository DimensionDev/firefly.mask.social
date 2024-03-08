import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Trans } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { forwardRef } from 'react';

import { Modal } from '@/components/Modal.js';
import { ComposeModalRef, DiscardModalRef } from '@/modals/controls.js';

export type DiscardModalProps = void;

export const DiscardModal = forwardRef<SingletonModalRefCreator>(function DiscardModal(_, ref) {
    const [open, dispatch] = useSingletonModal(ref);

    return (
        <Modal open={open} onClose={() => dispatch?.close()}>
            <Dialog.Panel className=" flex w-[370px] flex-col gap-6 overflow-hidden rounded-xl bg-bgModal p-6 text-[15px] transition-all">
                {/* Title */}
                <Dialog.Title as="h3" className=" relative h-6">
                    <XMarkIcon
                        className="absolute left-0 top-0 h-6 w-6 cursor-pointer"
                        aria-hidden="true"
                        onClick={() => dispatch?.close()}
                    />

                    <span className=" flex h-full w-full items-center justify-center text-lg font-bold capitalize leading-6 text-main">
                        <Trans>Discard</Trans>
                    </span>
                </Dialog.Title>

                <div>
                    <Trans>This can’t be undone and you’ll lose your draft.</Trans>
                </div>

                <button
                    className=" flex h-10 w-full items-center justify-center rounded-full bg-danger font-bold text-white"
                    onClick={() => {
                        DiscardModalRef.close();
                        ComposeModalRef.close();
                    }}
                >
                    <Trans>Confirm</Trans>
                </button>
            </Dialog.Panel>
        </Modal>
    );
});
