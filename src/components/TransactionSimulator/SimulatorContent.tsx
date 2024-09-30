import { Trans } from '@lingui/macro';

import { CloseButton } from '@/components/CloseButton.js';
import { DataPanel } from '@/components/TransactionSimulator/DataPanel.js';
import { SimulatorStatusBar } from '@/components/TransactionSimulator/SimulatorStatusBar.js';
import { SimulateStatus } from '@/constants/enum.js';

interface TransactionSimulatorProps {
    showCloseButton?: boolean;
    onClose: () => void;
}

export function TransactionSimulator({ showCloseButton = true, onClose }: TransactionSimulatorProps) {
    return (
        <div className="w-full">
            <div className="relative text-center">
                <span className="text-lg font-bold leading-6 text-lightMain">
                    <Trans>Transaction Simulation</Trans>
                </span>
                {showCloseButton ? (
                    <CloseButton onClick={() => onClose?.()} className="absolute -top-1 right-0" />
                ) : null}
            </div>
            <div className="mt-6">
                <DataPanel />
                {Object.values(SimulateStatus).map((status) => (
                    <SimulatorStatusBar key={status} status={status} />
                ))}
            </div>
        </div>
    );
}
