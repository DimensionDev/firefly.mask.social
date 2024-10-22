'use client';

import { t, Trans } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';
import { useContext, useState } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { ActivityMintSuccessDialog } from '@/components/Activity/ActivityMintSuccessDialog.js';
import { useActivityClaimCondition } from '@/components/Activity/hooks/useActivityClaimCondition.js';
import { useIsFollowTwitterInActivity } from '@/components/Activity/hooks/useActivityFollowTwitter.js';
import { useActivityPremiumList } from '@/components/Activity/hooks/useActivityPremiumList.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import { captureActivityEvent } from '@/providers/telemetry/captureActivityEvent.js';
import { ActivityStatus } from '@/providers/types/Firefly.js';
import { EventId } from '@/providers/types/Telemetry.js';
import { mintActivitySBT } from '@/services/mintActivitySBT.js';

export function ActivityClaimButton({ status }: { status: ActivityStatus }) {
    const { address, name } = useContext(ActivityContext);
    const { data: authToken } = useFireflyBridgeAuthorization();
    const { data, refetch } = useActivityClaimCondition();
    const [hash, setHash] = useState<string | undefined>(undefined);
    const [chainId, setChainId] = useState<ChainId | undefined>(undefined);
    const { data: isFollowedFirefly } = useIsFollowTwitterInActivity('1583361564479889408', 'thefireflyapp');
    const list = useActivityPremiumList();

    const isPremium = list.some((x) => x.verified);
    const disabled = status === ActivityStatus.Ended || !data?.canClaim || isFollowedFirefly;

    const [{ loading }, claim] = useAsyncFn(async () => {
        if (disabled || !address) return;
        try {
            const { hash, chainId } = await mintActivitySBT(address, name, { authToken });
            await refetch();
            setHash(hash);
            setChainId(chainId);
            if (isPremium) {
            }
            captureActivityEvent(isPremium ? EventId.EVENT_CLAIM_PREMIUM_SUCCESS : EventId.EVENT_CLAIM_BASIC_SUCCESS, {
                wallet_address: address,
            });
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to claim token`), { error });
            throw error;
        }
    }, [disabled, address, authToken, isPremium]);

    const buttonText = (() => {
        if (status === ActivityStatus.Ended) {
            return <Trans>Ended</Trans>;
        }
        if (data?.alreadyClaimed) {
            return <Trans>Claimed</Trans>;
        }
        if (!disabled && data?.canClaim) {
            return isPremium ? <Trans>Claim Premium</Trans> : <Trans>Claim Basic</Trans>;
        }
        return <Trans>Claim Now</Trans>;
    })();

    return (
        <>
            <ActivityMintSuccessDialog hash={hash} open={!!hash} chainId={chainId} onClose={() => setHash(undefined)} />
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
