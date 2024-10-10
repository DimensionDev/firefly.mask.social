import { TransactionSimulatorModalRef } from '@/modals/controls.js';
import { type TransactionSimulatorModalOpenProps } from '@/modals/TransactionSimulatorModal.js';

export function openSimulator(props: TransactionSimulatorModalOpenProps) {
    TransactionSimulatorModalRef.open(props);
}
