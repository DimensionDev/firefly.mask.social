import { DialogTitle } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { forwardRef, useCallback, useState } from 'react';

import { CloseButton } from '@/components/CloseButton.js';
import { Modal } from '@/components/Modal.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { MintButton } from '@/modals/FreeMintModal/MintButton.js';
import { MintParamsPanel } from '@/modals/FreeMintModal/MintParamsPanel.js';
import type { MintMetadata, NFTAsset } from '@/providers/types/Firefly.js';

export interface FreeMintModalOpenProps {
    nft: NFTAsset;
    mintParams: MintMetadata;
}

export const FreeMintModal = forwardRef<SingletonModalRefCreator<FreeMintModalOpenProps>>(
    function FreeMintModal(_, ref) {
        const [props, setProps] = useState<FreeMintModalOpenProps>();

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: (props) => setProps(props),
            onClose: () => setProps(undefined),
        });
        const onClose = useCallback(() => dispatch?.close(), [dispatch]);

        if (!props) return null;

        return (
            <Modal open={open} onClose={onClose}>
                <div className="w-[400px] max-w-[90vw] transform rounded-2xl bg-primaryBottom p-6 transition-all">
                    <DialogTitle as="h3" className="relative text-center text-main">
                        <CloseButton onClick={onClose} className="absolute -top-1 left-0" />
                        <span className="text-lg font-bold leading-[22px]">
                            <Trans>Mint NFT</Trans>
                        </span>
                    </DialogTitle>
                    <MintParamsPanel className="mt-6" {...props} />
                    <MintButton {...props} />
                </div>
            </Modal>
        );
    },
);
