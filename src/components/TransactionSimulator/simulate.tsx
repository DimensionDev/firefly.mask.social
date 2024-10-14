import { TransactionSimulator } from '@/components/TransactionSimulator/SimulatorContent.js';
import { UserRejectionError } from '@/constants/error.js';
import { DraggablePopoverRef, TransactionSimulatorModalRef } from '@/modals/controls.js';
import { type TransactionSimulatorModalOpenProps } from '@/modals/TransactionSimulatorModal.js';

export function simulate(props: TransactionSimulatorModalOpenProps) {
    return new Promise<void>((resolve, reject) => {
        const isMedium = window.matchMedia('(min-width: 990px)').matches;
        const onCanceled = () => reject(new UserRejectionError('User canceled the simulation'));

        if (isMedium) {
            TransactionSimulatorModalRef.open({
                ...props,
                onContinue: resolve,
                onCanceled,
            });
        } else {
            DraggablePopoverRef.open({
                onClose: onCanceled,
                content: (
                    <TransactionSimulator
                        showCloseButton={false}
                        options={props}
                        onContinue={() => {
                            resolve();
                            DraggablePopoverRef.close();
                        }}
                    />
                ),
            });
        }
    });
}
