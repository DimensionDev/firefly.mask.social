import { t, Trans } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import {
    clearS3Cache,
    downloadAdvertisement,
    jsonToFile,
} from '@/app/(developers)/developers/advertisement/helpers.js';
import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ADVERTISEMENT_JSON_URL, ADVERTISEMENT_JSON_URL_DEV } from '@/constants/index.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { uploadToDirectory } from '@/services/uploadToS3.js';

export function AdvertisementSyncButtons() {
    const [{ loading: devLoading }, syncDevToProduction] = useAsyncFn(async () => {
        try {
            const confirmed = await ConfirmModalRef.openAndWaitForClose({
                title: t`Sync Advertisement`,
                variant: 'normal',
                content: t`Are you sure you want to sync development to production?`,
            });
            if (!confirmed) return;
            const data = await downloadAdvertisement(ADVERTISEMENT_JSON_URL_DEV);
            const jsonFile = await jsonToFile(data, 'web.json');

            await uploadToDirectory(jsonFile, 'advertisement', () => 'web.json');
            await clearS3Cache('/advertisement/web.json');

            enqueueSuccessMessage(t`Successfully synced development to production`);
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to sync development to production`), {
                error,
            });
            throw error;
        }
    }, []);

    const [{ loading: prodLoading }, syncProductionToDev] = useAsyncFn(async () => {
        try {
            const data = await downloadAdvertisement(ADVERTISEMENT_JSON_URL);
            const jsonFile = await jsonToFile(data, 'web-dev.json');

            await uploadToDirectory(jsonFile, 'advertisement', () => 'web-dev.json');
            await clearS3Cache('/advertisement/web-dev.json');

            enqueueSuccessMessage(t`Successfully synced production to development`);
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to sync production to development`), {
                error,
            });
            throw error;
        }
    }, []);

    return (
        <div className="mt-5 flex flex-col gap-y-2 border-t border-line py-3 text-[18px] leading-[24px] text-main">
            <div className="flex justify-between">
                <span>
                    <Trans>Sync Development to Production</Trans>
                </span>
                <ClickableButton
                    className="w-16 rounded-md bg-main px-2 py-1 text-primaryBottom"
                    onClick={syncDevToProduction}
                    disabled={devLoading}
                >
                    {devLoading ? (
                        <LoadingIcon className="inline-block animate-spin" width={20} height={20} />
                    ) : (
                        t`Sync`
                    )}
                </ClickableButton>
            </div>
            <div className="flex justify-between">
                <span>
                    <Trans>Sync Production to Development</Trans>
                </span>
                <ClickableButton
                    className="w-16 rounded-md bg-main px-2 py-1 text-primaryBottom"
                    onClick={syncProductionToDev}
                    disabled={prodLoading}
                >
                    {prodLoading ? (
                        <LoadingIcon className="inline-block animate-spin" width={20} height={20} />
                    ) : (
                        t`Sync`
                    )}
                </ClickableButton>
            </div>
        </div>
    );
}
