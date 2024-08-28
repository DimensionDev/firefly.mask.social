import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { Link, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { useAsyncFn, useMount, useUnmount } from 'react-use';
import { useCountdown } from 'usehooks-ts';
import { UserRejectedRequestError } from 'viem';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ScannableQRCode } from '@/components/ScannableQRCode.js';
import { IS_MOBILE_DEVICE } from '@/constants/bowser.js';
import { FarcasterSignType, FarcasterSignType as SignType, Source } from '@/constants/enum.js';
import { AbortError, NotAllowedError, TimeoutError } from '@/constants/error.js';
import { FARCASTER_REPLY_COUNTDOWN } from '@/constants/index.js';
import { type AccountOptions, addAccount } from '@/helpers/account.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getMobileDevice } from '@/helpers/getMobileDevice.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { runInSafe } from '@/helpers/runInSafe.js';
import { useAbortController } from '@/hooks/useAbortController.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { LoginModalRef } from '@/modals/controls.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import type { Account } from '@/providers/types/Account.js';
import { createAccountByGrantPermission } from '@/providers/warpcast/createAccountByGrantPermission.js';
import { createAccountByRelayService } from '@/providers/warpcast/createAccountByRelayService.js';
import { reportFarcasterSigner } from '@/services/reportFarcasterSigner.js';

async function login(createAccount: () => Promise<Account>, options?: Omit<AccountOptions, 'source'>) {
    try {
        const account = await createAccount();

        const done = await addAccount(account, options);
        if (done) {
            enqueueSuccessMessage(t`Your ${resolveSourceName(Source.Farcaster)} account is now connected.`);

            // report signer to Firefly (no-blocking) after the account is added
            runInSafe(() => reportFarcasterSigner(account.session as FarcasterSession));
        }
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

interface LoginFarcasterProps {
    signType: SignType | null;
}

export function LoginFarcaster({ signType }: LoginFarcasterProps) {
    const controller = useAbortController();

    const isMedium = useIsMedium();

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

    const onClick = (signType: FarcasterSignType | null) => {
        if (!signType) return;
        switch (signType) {
            case SignType.GrantPermission:
                onLoginByGrantPermission();
                break;
            case SignType.RelayService:
                onLoginByRelayService();
                break;
            case SignType.RecoveryPhrase:
                throw new NotAllowedError();
            default:
                safeUnreachable(signType);
                break;
        }
    };

    useMount(() => {
        onClick(signType);
    });

    useUnmount(() => {
        if (IS_MOBILE_DEVICE) resetCountdown();
    });

    // let the user select sign type on mobile devices
    if (!signType || signType === FarcasterSignType.RecoveryPhrase) {
        if (isMedium) return null;

        const options = [
            {
                label: t`New connect with Warpcast`,
                type: FarcasterSignType.GrantPermission,
                developmentOnly: false,
                isFreeOfTransactionFee: false,
            },
            {
                label: t`Reconnect with Firefly`,
                type: FarcasterSignType.RelayService,
                developmentOnly: false,
                isFreeOfTransactionFee: true,
            },
        ] as const;

        return (
            <div className="flex flex-col gap-2 rounded-[12px] p-4 md:w-[600px]">
                <p className="pb-2 text-left text-sm">
                    <Trans>You can sign in to Farcaster with the following options.</Trans>
                </p>
                {options.map(({ label, type, isFreeOfTransactionFee }) => (
                    <ClickableButton
                        className="flex w-full items-center rounded-lg border border-line px-3 py-4 text-main hover:bg-bg"
                        key={type}
                        onClick={() => {
                            history.replace(`/farcaster?signType=${type}`);
                            onClick(type);
                        }}
                    >
                        <span className="flex flex-1 items-center">
                            {label}
                            {isFreeOfTransactionFee ? (
                                <span className="ml-2 rounded-md border border-main px-1 text-xs font-bold text-main">
                                    {t`FREE`}
                                </span>
                            ) : null}
                        </span>
                        <ArrowRightIcon width={24} height={24} className="rounded-full p-1 text-main" />
                    </ClickableButton>
                ))}
            </div>
        );
    }

    return (
        <div className="box-border flex flex-col rounded-xl p-6 md:w-[500px]">
            {IS_MOBILE_DEVICE ? (
                <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-4">
                    {count !== 0 ? <LoadingIcon className="animate-spin" width={24} height={24} /> : null}
                    <div className="mt-2 text-center text-sm leading-[16px] text-lightSecond">
                        {count !== 0 ? (
                            <Trans>Please confirm the login with Warpcast.</Trans>
                        ) : (
                            <Trans>The connection has timed out. Please try again later.</Trans>
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
                                    onClick(signType);
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
                                        Approve the{' '}
                                        <Link
                                            to={`/farcaster?signType=${SignType.RelayService}`}
                                            className="font-bold hover:underline"
                                        >
                                            existing Farcaster signer
                                        </Link>{' '}
                                        to Firefly or{' '}
                                        <Link to={'/main'} className="font-bold hover:underline">
                                            sync
                                        </Link>{' '}
                                        through the app
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
