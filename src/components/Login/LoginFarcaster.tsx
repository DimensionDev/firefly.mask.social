import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { Link, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { useAsyncFn, useMount, useUnmount } from 'react-use';
import { useCountdown } from 'usehooks-ts';
import { UserRejectedRequestError } from 'viem';

import LoadingIcon from '@/assets/loading.svg';
import { ScannableQRCode } from '@/components/ScannableQRCode.js';
import { IS_MOBILE_DEVICE } from '@/constants/bowser.js';
import { FarcasterSignType, FarcasterSignType as SignType, Source } from '@/constants/enum.js';
import { AbortError, TimeoutError } from '@/constants/error.js';
import { FARCASTER_REPLY_COUNTDOWN } from '@/constants/index.js';
import { type AccountOptions, addAccount } from '@/helpers/account.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getMobileDevice } from '@/helpers/getMobileDevice.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useAbortController } from '@/hooks/useAbortController.js';
import { LoginModalRef } from '@/modals/controls.js';
import type { Account } from '@/providers/types/Account.js';
import { createAccountByGrantPermission } from '@/providers/warpcast/createAccountByGrantPermission.js';
import { createAccountByRelayService } from '@/providers/warpcast/createAccountByRelayService.js';

async function login(createAccount: () => Promise<Account>, options?: Omit<AccountOptions, 'source'>) {
    try {
        const done = await addAccount(await createAccount(), options);
        if (done) enqueueSuccessMessage(t`Your ${resolveSourceName(Source.Farcaster)} account is now connected.`);
        LoginModalRef.close();
    } catch (error) {
        // skip if the error is abort error
        if (AbortError.is(error)) return;

        // if login timed out, let the user refresh the QR code
        if (error instanceof TimeoutError) return;

        // user rejected request
        if (error instanceof UserRejectedRequestError) return;

        // if any error occurs, close the modal
        // by this we don't need to do error handling in UI part.
        LoginModalRef.close();
        throw error;
    }
}

export interface LoginFarcasterProps {
    signType: SignType | null;
}

export function LoginFarcaster({ signType }: LoginFarcasterProps) {
    const controller = useAbortController();

    const [url, setUrl] = useState('');
    const [scanned, setScanned] = useState(false);
    const router = useRouter();
    const { history } = router;

    const [count, { startCountdown, resetCountdown }] = useCountdown({
        countStart: FARCASTER_REPLY_COUNTDOWN,
        intervalMs: 1000,
        countStop: 0,
        isIncrement: false,
    });

    const [, onLoginByGrantPermission] = useAsyncFn(async () => {
        controller.current.renew();

        try {
            await login(
                () =>
                    createAccountByGrantPermission((url) => {
                        const device = getMobileDevice();
                        if (device === 'unknown') setUrl(url);
                        else location.href = url;

                        resetCountdown();
                        startCountdown();
                    }, controller.current.signal),
                { signal: controller.current.signal },
            );
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to login.`), {
                error,
            });
            throw error;
        }
    }, [resetCountdown, startCountdown]);

    const [, onLoginByRelayService] = useAsyncFn(async () => {
        controller.current.renew();

        try {
            await login(
                async () => {
                    const account = await createAccountByRelayService((url) => {
                        resetCountdown();
                        startCountdown();
                        setScanned(false);

                        const device = getMobileDevice();
                        if (device === 'unknown') setUrl(url);
                        else location.href = url;
                    }, controller.current.signal);

                    // let the user see the qr code has been scanned and display a loading icon
                    setScanned(true);

                    if (!account.session.token) {
                        enqueueErrorMessage(t`Cannot find your signer key, please connect again`);
                        history.replace(`/farcaster?signType=${FarcasterSignType.GrantPermission}`);
                        throw new AbortError();
                    }

                    return account;
                },
                { signal: controller.current.signal },
            );
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to login.`), {
                error,
            });
            throw error;
        }
    }, [resetCountdown, startCountdown]);

    useMount(() => {
        if (!signType) return;
        switch (signType) {
            case SignType.GrantPermission:
                onLoginByGrantPermission();
                break;
            case SignType.RelayService:
                onLoginByRelayService();
                break;
        }
    });

    useUnmount(() => {
        if (IS_MOBILE_DEVICE) resetCountdown();
    });

    if (!signType || signType === SignType.RecoveryPhrase) return null;

    return (
        <div className="box-border flex flex-col rounded-xl p-6 md:w-[500px]">
            {IS_MOBILE_DEVICE ? (
                <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-4">
                    {count !== 0 ? <LoadingIcon className="animate-spin" width={24} height={24} /> : null}
                    <div className="mt-2 text-center text-sm leading-[16px] text-lightSecond">
                        {count !== 0 ? (
                            <Trans>Please confirm the login with Warpcast.</Trans>
                        ) : (
                            <Trans>The connection has timed out. Please try again later.·</Trans>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex w-full flex-col items-center gap-4">
                    {url ? (
                        <>
                            <div className="text-center text-xs leading-4 text-lightSecond">
                                {signType === SignType.GrantPermission ? (
                                    <Trans>
                                        Scan the QR code with your phone’s <b className="font-bold">Camera</b> in{' '}
                                        {count}s. <br />
                                        Approve a new Farcaster signer to Firefly.
                                    </Trans>
                                ) : signType === SignType.RelayService ? (
                                    <Trans>
                                        Scan the QR code with your phone’s <b className="font-bold">Camera</b> in{' '}
                                        {count}s.
                                        <br /> Approve the existing Farcaster signer to Firefly.
                                    </Trans>
                                ) : null}
                            </div>
                            <div
                                className={classNames('relative flex items-center justify-center', {
                                    'cursor-pointer': !scanned,
                                })}
                                onClick={() => {
                                    if (scanned) return;
                                    controller.current.abort();

                                    resetCountdown();
                                    switch (signType) {
                                        case SignType.GrantPermission:
                                            onLoginByGrantPermission();
                                            break;
                                        case SignType.RelayService:
                                            onLoginByRelayService();
                                            break;
                                        default:
                                            safeUnreachable(signType);
                                            break;
                                    }
                                }}
                            >
                                <ScannableQRCode url={url} scanned={scanned} countdown={count} />
                                {scanned ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <LoadingIcon className="animate-spin" width={24} height={24} />
                                    </div>
                                ) : null}
                            </div>
                            <div className="text-center text-xs leading-4 text-lightSecond">
                                {signType === SignType.GrantPermission ? (
                                    <Trans>
                                        Already logged in?
                                        <br />
                                        <Link
                                            to={`/farcaster?signType=${SignType.RelayService}`}
                                            className="font-bold hover:underline"
                                        >
                                            Approve the existing Farcaster signer
                                        </Link>{' '}
                                        to Firefly
                                    </Trans>
                                ) : signType === SignType.RelayService ? (
                                    <Trans>
                                        First time connecting to Firefly?
                                        <br />
                                        <Link
                                            to={`/farcaster?signType=${SignType.GrantPermission}`}
                                            className="font-bold hover:underline"
                                        >
                                            Approve a new connection
                                        </Link>{' '}
                                        with Warpcast
                                    </Trans>
                                ) : null}
                            </div>
                        </>
                    ) : (
                        <div className="flex min-h-[200px] flex-col items-center justify-center">
                            <LoadingIcon className="animate-spin" width={24} height={24} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
