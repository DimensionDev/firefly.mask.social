import { t, Trans } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { WalletConnection } from '@/providers/types/Firefly.js';
import { waitForSelectReportReason } from '@/app/(settings)/components/waitForSelectReportReason.js';

interface ReportButtonProps {
    connection: WalletConnection;
}

export function ReportButton({ connection }: ReportButtonProps) {
    const [{ loading }, handleReport] = useAsyncFn(async () => {
        try {
            const reason = await waitForSelectReportReason();
            if (!reason) return;
            await FireflySocialMediaProvider.reportAndDeleteWallet({
                twitterId: connection.twitterId,
                walletAddress: connection.address,
                reportReason: reason,
                sources: connection.sources.map((x) => x.source),
            });
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
