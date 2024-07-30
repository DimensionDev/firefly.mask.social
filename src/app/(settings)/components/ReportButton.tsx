import { t, Trans } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { waitForSelectReportReason } from '@/app/(settings)/components/WaitForDisconnectConfirmation.js';
import LoadingIcon from '@/assets/loading.svg';
import { Source } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { LoginModalRef } from '@/modals/controls.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireflyProfile, WalletProfile } from '@/providers/types/Firefly.js';

interface ReportButtonProps {
    profile: FireflyProfile;
}

export function ReportButton({ profile }: ReportButtonProps) {
    const twitterProfile = useCurrentProfile(Source.Twitter);

    const [{ loading }, handleReport] = useAsyncFn(async () => {
        try {
            if (!twitterProfile) return LoginModalRef.open({ source: Source.Twitter });
            const reason = await waitForSelectReportReason();
            if (!reason) return;
            await FireflySocialMediaProvider.reportAndDeleteWallet({
                twitterId: twitterProfile.profileId,
                walletAddress: profile.identity,
                reportReason: reason,
                sources: (profile.__origin__ as WalletProfile)?.verifiedSources.map((x) => x.source),
            });
            enqueueSuccessMessage(t`Disconnected from your social graph`);
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to disconnect`), { error });
            throw error;
        }
    }, [twitterProfile, profile]);

    if (loading) {
        return <LoadingIcon className="animate-spin" width={20} height={20} />;
    }

    return (
        <span className="cursor-pointer font-bold text-danger" onClick={handleReport}>
            <Trans>Report</Trans>
        </span>
    );
}
