import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { CloseButton } from '@/components/CloseButton.js';
import { ContinueButton } from '@/components/TransactionSimulator/ContinueButton.js';
import { DataPanel } from '@/components/TransactionSimulator/DataPanel.js';
import { simulateAndCheckSecurity } from '@/components/TransactionSimulator/simulateAndCheckSecurity.js';
import { SimulatorStatusBar } from '@/components/TransactionSimulator/SimulatorStatusBar.js';
import { SimulateStatus, SimulateType } from '@/constants/enum.js';
import type { SimulationOptions } from '@/providers/types/Tenderly.js';

interface TransactionSimulatorProps {
    options: SimulationOptions;
    showCloseButton?: boolean;
    onClose?: () => void;
    onContinue?: () => void;
}
export function TransactionSimulator({
    options,
    showCloseButton = true,
    onContinue,
    onClose,
}: TransactionSimulatorProps) {
    const account = useAccount();
    const isUnConnected = !account.isConnected || !account.address;

    const { data, isLoading, isRefetching, refetch } = useQuery({
        queryKey: [
            'transaction-simulator',
            options.chainId,
            options.type,
            options.url,
            options.transaction?.to,
            options.transaction?.data,
            options.transaction?.value?.toString(),
        ],
        queryFn: async () => {
            return await simulateAndCheckSecurity(options);
        },
        enabled: !isUnConnected,
    });

    const loading = isLoading || isRefetching;
    const simulateType = options.type || data?.simulation?.method;

    return (
        <div className="w-full">
            <div className="relative text-center">
                <span className="text-lg font-bold leading-6 text-lightMain">
                    <Trans>Transaction Simulation</Trans>
                </span>
                {showCloseButton ? (
                    <CloseButton onClick={() => onClose?.()} className="absolute -top-1 left-0" />
                ) : null}
            </div>
            <div className="mt-6">
                <DataPanel
                    type={simulateType || SimulateType.Unknown}
                    loading={loading}
                    data={options}
                    simulation={data?.simulation}
                />
                {loading ? (
                    <SimulatorStatusBar status={SimulateStatus.Pending} />
                ) : data ? (
                    <SimulatorStatusBar status={data.status} messages={data.messages} retry={refetch} />
                ) : null}
                <ContinueButton
                    onClick={onContinue}
                    disabled={loading || data?.status === SimulateStatus.Error}
                    status={data?.status ?? SimulateStatus.Pending}
                />
            </div>
        </div>
    );
}
