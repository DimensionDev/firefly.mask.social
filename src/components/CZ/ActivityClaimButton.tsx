'use client';

import { t, Trans } from '@lingui/macro';
import { type HTMLProps, useContext } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';

import LoadingIcon from '@/assets/loading.svg';
import { ActivityContext } from '@/components/CZ/ActivityContext.js';
import { IS_IOS } from '@/constants/bowser.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { Level } from '@/providers/types/CZ.js';
import { type Response } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

interface Props extends HTMLProps<'button'> {
    level?: Level;
    alreadyClaimed?: boolean;
    canClaim?: boolean;
    isLoading?: boolean;
}

export function ActivityClaimButton({ level, alreadyClaimed = false, canClaim, isLoading = false, className }: Props) {
    const { onClaim, address, authToken } = useContext(ActivityContext);
    const disabled = isLoading || alreadyClaimed;
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
            >(urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet_transaction/mint/bnb/sbt'), {
                method: 'POST',
                body: JSON.stringify({
                    walletAddress: address,
                    claimPlatform,
                }),
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (response.error || !response.data) {
                throw new Error(response.error?.[0] ?? t`Unknown error`);
            }
            if (response.data.errormessage) {
                throw new Error(response.data.errormessage ?? t`Unknown error`);
            }
            onClaim(response.data.hash);
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Unknown error`));
            throw error;
        }
    });

    if (isLoading) {
        return (
            <span className="mx-auto text-sm font-bold text-white/70">
                <Trans>Verifying eligibility...</Trans>
            </span>
        );
    }

    if (!canClaim) {
        return (
            <Link href="/activity/cz" className="mx-auto text-sm font-bold text-white/70">
                <Trans>
                    Not eligible to claim, <span className="text-[#AC9DF6]">retry</span>
                </Trans>
            </Link>
        );
    }

    return (
        <>
            {level === Level.Lv2 ? (
                <button
                    disabled={disabled || loading}
                    className={classNames(
                        'flex h-12 min-w-[140px] items-center justify-center rounded-full bg-gradient-to-b from-[#ffeecc] to-[rgba(255,255,255,0)] p-[1px] text-sm font-bold leading-[48px] text-[#181a20]',
                        className,
                    )}
                    onClick={claim}
                >
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-[#1f1f1f] px-[18px]">
                        {loading ? (
                            <LoadingIcon className="animate-spin text-white" width={16} height={16} />
                        ) : (
                            <span className="bg-gradient-to-r from-[#ffeecc] to-[#ad9515] bg-clip-text text-transparent">
                                <Trans>Claim Premium</Trans>
                            </span>
                        )}
                    </span>
                </button>
            ) : (
                <button
                    type="button"
                    className={classNames(
                        'leading-12 text-md flex h-12 w-[75px] items-center justify-center rounded-full bg-[#f4d008] font-bold text-black disabled:bg-white/70',
                        className,
                    )}
                    disabled={disabled || loading}
                    onClick={claim}
                >
                    {loading ? <LoadingIcon className="animate-spin" width={16} height={16} /> : <Trans>Claim</Trans>}
                </button>
            )}
        </>
    );
}
