import { Trans } from '@lingui/macro';
import { useAsync } from 'react-use';

import { CloseButton } from '@/components/CloseButton.js';
import { DataPanel } from '@/components/TransactionSimulator/DataPanel.js';
import { simulateAndCheckSecurity } from '@/components/TransactionSimulator/simulateAndCheckSecurity.js';
import { SimulatorStatusBar } from '@/components/TransactionSimulator/SimulatorStatusBar.js';
import { SimulateStatus } from '@/constants/enum.js';
import type { SimulationOptions } from '@/providers/types/Tenderly.js';

interface TransactionSimulatorProps {
    options: SimulationOptions;
    showCloseButton?: boolean;
    onClose: () => void;
}
export function TransactionSimulator({ options, showCloseButton = true, onClose }: TransactionSimulatorProps) {
    const { value, loading } = useAsync(async () => {
        return await simulateAndCheckSecurity(options);
    }, [options]);

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
                {loading ? (
                    <SimulatorStatusBar status={SimulateStatus.Pending} />
                ) : value ? (
                    <SimulatorStatusBar status={value.status} messages={value.messages} />
                ) : null}
            </div>
        </div>
    );
}
