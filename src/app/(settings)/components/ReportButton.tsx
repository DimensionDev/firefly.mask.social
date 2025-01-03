import { t, Trans } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { waitForSelectReportReason } from '@/app/(settings)/components/waitForSelectReportReason.js';
import LoadingIcon from '@/assets/loading.svg';
import { enqueueMessageFromError, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';

interface ReportButtonProps {
    connection: FireflyWalletConnection;
}

export function ReportButton({ connection }: ReportButtonProps) {
    const [{ loading }, handleReport] = useAsyncFn(async () => {
        try {
            const reason = await waitForSelectReportReason();
            if (!reason) return;

            await FireflyEndpointProvider.reportAndDeleteWallet(connection, reason);
            await FireflyEndpointProvider.disconnectWallet(connection.address);
            enqueueSuccessMessage(t`Disconnected from your social graph`);
        } catch (error) {
            enqueueMessageFromError(error, t`Failed to disconnect`);
            throw error;
        }
    }, [connection]);

    if (loading) {
        return <LoadingIcon className="animate-spin" width={20} height={20} />;
    }

    return (
        <span className="cursor-pointer font-bold text-danger" onClick={handleReport}>
            <Trans>Report</Trans>
        </span>
    );
}
