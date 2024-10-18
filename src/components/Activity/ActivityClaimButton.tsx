import { t, Trans } from '@lingui/macro';
import { useContext, useState } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';

import LoadingIcon from '@/assets/loading.svg';
import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { ActivityMintSuccessDialog } from '@/components/Activity/ActivityMintSuccessDialog.js';
import { useActivityClaimCondition } from '@/components/Activity/hooks/useActivityClaimCondition.js';
import { IS_IOS } from '@/constants/bowser.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { ActivityStatus, type Response } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

export function ActivityClaimButton({ status }: { status: ActivityStatus }) {
    const { address } = useContext(ActivityContext);
    const authToken = useFireflyBridgeAuthorization();
    const { data, refetch } = useActivityClaimCondition();
    const disabled = status === ActivityStatus.Ended || !data?.canClaim;
    const [hash, setHash] = useState<string | undefined>(undefined);
    const [{ loading }, claim] = useAsyncFn(async () => {
        if (disabled || !address) return;
        try {
            let claimPlatform = 'web';
            if (fireflyBridgeProvider.supported) claimPlatform = IS_IOS ? 'ios' : 'android';
            const response = await fireflySessionHolder.fetch<
                Response<{
                    status: boolean;
                    hash: string;
                    errormessage?: string;
                }>
            >(
                urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet_transaction/mint/bnb/sbt'), // TODO: new api
                {
                    method: 'POST',
                    body: JSON.stringify({
                        walletAddress: address,
                        claimPlatform,
                    }),
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                },
            );
            await refetch();
            if (response.error || !response.data) {
                throw new Error(response.error?.[0] ?? t`Failed to claim token`);
            }
            if (response.data.errormessage) {
                throw new Error(response.data.errormessage);
            }
            setHash(response.data.hash);
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to claim token`), { error });
            throw error;
        }
    });

    return (
        <>
            <ActivityMintSuccessDialog hash={hash} open={!!hash} onClose={() => setHash(undefined)} />
            <button
                className="leading-12 relative flex h-12 w-full items-center justify-center rounded-full bg-main text-center text-base font-bold text-primaryBottom disabled:opacity-60"
                disabled={disabled || loading}
                onClick={claim}
            >
                {loading ? (
                    <span className="left-0 top-0 flex h-full w-full items-center justify-center">
                        <LoadingIcon className="animate-spin" width={16} height={16} />
                    </span>
                ) : null}
                <span
                    className={classNames('flex items-center', {
                        'opacity-0': loading,
                    })}
                >
                    {disabled ? <Trans>Ended</Trans> : <Trans>Claim Now</Trans>}
                </span>
            </button>
        </>
    );
}
