'use client';

import { t, Trans } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { type HTMLProps, useContext } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';
import { useAccount } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import { CZActivityContext } from '@/components/ActivityPage/CZ/CZActivityContext.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { CZActivity, type Response } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

interface Props extends HTMLProps<'button'> {
    level?: CZActivity.Level;
    alreadyClaimed?: boolean;
    canClaim?: boolean;
    isLoading?: boolean;
}

export function CZActivityClaimButton({
    level,
    alreadyClaimed = false,
    canClaim,
    isLoading = false,
    className,
}: Props) {
    const { onClaim } = useContext(CZActivityContext);
    const disabled = isLoading || alreadyClaimed;
    const account = useAccount();
    const address = account.address; // TODO: and address from mobile
    const queryClient = useQueryClient();
    const [{ loading }, claim] = useAsyncFn(async () => {
        if (disabled || !address) return;
        try {
            const response = await fireflySessionHolder.fetch<Response<{}>>(
                urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet_transaction/mint/bnb/sbt'),
                {
                    method: 'POST',
                    body: JSON.stringify({
                        walletAddress: address,
                        claimPlatform: 'web',
                    }),
                },
            );
            if (!response.error) {
                throw new Error(response.error?.[0] ?? t`Unknown error`);
            }
            onClaim();
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Unknown error`));
            throw error;
        }
    });
    const [{ loading: isRetrying }, retry] = useAsyncFn(() => {
        return queryClient.refetchQueries({
            queryKey: ['cz-activity-check'],
        });
    });

    if (isLoading || isRetrying) {
        return (
            <span className="mx-auto text-sm font-bold text-white/70">
                <Trans>Verifying eligibility...</Trans>
            </span>
        );
    }

    if (!canClaim) {
        return (
            <button className="mx-auto text-sm font-bold text-white/70" onClick={retry}>
                <Trans>
                    Not eligible to claim, <span className="text-[#AC9DF6]">retry</span>
                </Trans>
            </button>
        );
    }

    return (
        <>
            {level === CZActivity.Level.Lv2 ? (
                <button
                    disabled={disabled || loading}
                    className={classNames(
                        'flex h-12 w-[140px] items-center justify-center rounded-full bg-gradient-to-b from-[#ffeecc] to-[rgba(255,255,255,0)] p-[1px] text-sm font-bold leading-[48px] text-[#181a20]',
                        className,
                    )}
                    onClick={claim}
                >
                    {loading ? (
                        <LoadingIcon className="animate-spin text-white" width={16} height={16} />
                    ) : (
                        <span className="block h-full w-full rounded-full bg-[#1f1f1f] px-[18px]">
                            <span className="bg-gradient-to-r from-[#ffeecc] to-[#ad9515] bg-clip-text text-transparent">
                                <Trans>Claim Premium</Trans>
                            </span>
                        </span>
                    )}
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
