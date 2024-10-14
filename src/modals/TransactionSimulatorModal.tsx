import { forwardRef, useCallback, useState } from 'react';

import { Modal } from '@/components/Modal.js';
import { TransactionSimulator } from '@/components/TransactionSimulator/SimulatorContent.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import type { SimulationOptions } from '@/providers/types/Tenderly.js';

export type TransactionSimulatorModalOpenProps = SimulationOptions & {
    onContinue?: () => void;
    onCanceled?: () => void;
};

export const TransactionSimulatorModal = forwardRef<SingletonModalRefCreator<TransactionSimulatorModalOpenProps>>(
    function TransactionSimulatorModal(_, ref) {
        const [props, setProps] = useState<TransactionSimulatorModalOpenProps>();
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: (props) => setProps(props),
            onClose: () => {
                props?.onCanceled?.();
                setProps(undefined);
            },
        });
        const onClose = useCallback(() => dispatch?.close(), [dispatch]);
        const onContinue = useCallback(() => {
            props?.onContinue?.();
            onClose();
        }, [onClose, props]);

        if (!props) return null;

        return (
            <Modal open={open} onClose={onClose}>
                <div className="w-[485px] max-w-[90vw] transform rounded-xl bg-primaryBottom p-6 transition-all">
                    <TransactionSimulator options={props} onClose={onClose} onContinue={onContinue} />
                </div>
            </Modal>
        );
    },
);
