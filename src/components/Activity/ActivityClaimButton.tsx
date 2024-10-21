'use client';

import { t, Trans } from '@lingui/macro';
import { useContext, useState } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { ActivityMintSuccessDialog } from '@/components/Activity/ActivityMintSuccessDialog.js';
import { useActivityClaimCondition } from '@/components/Activity/hooks/useActivityClaimCondition.js';
import { useActivityPremiumList } from '@/components/Activity/hooks/useActivityPremiumList.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import { ActivityStatus } from '@/providers/types/Firefly.js';
import { mintActivitySBT } from '@/services/mintActivitySBT.js';

export function ActivityClaimButton({ status }: { status: ActivityStatus }) {
    const { address, name } = useContext(ActivityContext);
    const { data: authToken } = useFireflyBridgeAuthorization();
    const { data, refetch } = useActivityClaimCondition();
    const disabled = status === ActivityStatus.Ended || !data?.canClaim;
    const [hash, setHash] = useState<string | undefined>(undefined);
    const [{ loading }, claim] = useAsyncFn(async () => {
        if (disabled || !address) return;
        try {
            const { hash } = await mintActivitySBT(address, name, { authToken });
            await refetch();
            setHash(hash);
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to claim token`), { error });
            throw error;
        }
    }, [disabled, address, authToken]);
    const list = useActivityPremiumList();

    const buttonText = (() => {
        if (status === ActivityStatus.Ended) {
            return <Trans>Ended</Trans>;
        }
        if (data?.alreadyClaimed) {
            return <Trans>Claimed</Trans>;
        }
        if (data?.canClaim) {
            return list.some((x) => x.verified) ? <Trans>Claim Premium</Trans> : <Trans>Claim Basic</Trans>;
        }
        return <Trans>Claim Now</Trans>;
    })();

    return (
        <>
            <ActivityMintSuccessDialog hash={hash} open={!!hash} onClose={() => setHash(undefined)} />
            <button
                className="leading-12 relative flex h-12 w-full items-center justify-center rounded-full bg-main text-center text-base font-bold text-primaryBottom disabled:opacity-60"
                disabled={disabled || loading}
                onClick={claim}
            >
                {loading ? (
                    <span className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
                        <LoadingIcon className="animate-spin" width={16} height={16} />
                    </span>
                ) : null}
                <span
                    className={classNames('flex items-center', {
                        'opacity-0': loading,
                    })}
                >
                    {buttonText}
                </span>
            </button>
        </>
    );
}
