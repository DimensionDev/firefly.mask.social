import { t, Trans } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { reportNFT } from '@/services/reportNFT.js';

export function useReportSpamNFT() {
    return useAsyncFn(async (collectionId: string) => {
        const confirmed = await ConfirmModalRef.openAndWaitForClose({
            title: t`Report Spam`,
            variant: 'normal',
            content: (
                <div className="text-main">
                    <Trans>Are you sure you want to report this collection?</Trans>
                </div>
            ),
        });
        if (!confirmed) return;
        try {
            await reportNFT(collectionId);
            enqueueSuccessMessage(t`Report submitted`);
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Report Failed`), {
                error,
            });
            throw error;
        }
    }, []);
}
