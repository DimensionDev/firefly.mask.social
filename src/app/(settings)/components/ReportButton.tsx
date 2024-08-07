import { t, Trans } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { waitForSelectReportReason } from '@/app/(settings)/components/waitForSelectReportReason.js';
import LoadingIcon from '@/assets/loading.svg';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';

interface ReportButtonProps {
    connection: FireflyWalletConnection;
}

export function ReportButton({ connection }: ReportButtonProps) {
    const [{ loading }, handleReport] = useAsyncFn(async () => {
        try {
            const reason = await waitForSelectReportReason();
            if (!reason) return;

            await FireflySocialMediaProvider.reportAndDeleteWallet(connection, reason);
            enqueueSuccessMessage(t`Disconnected from your social graph`);
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to disconnect`), { error });
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
