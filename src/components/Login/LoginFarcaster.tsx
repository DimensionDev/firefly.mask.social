import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useAsyncFn, useMount, useUnmount } from 'react-use';
import { useCountdown } from 'usehooks-ts';
import { UserRejectedRequestError } from 'viem';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ScannableQRCode } from '@/components/ScannableQRCode.js';
import { IS_MOBILE_DEVICE } from '@/constants/bowser.js';
import { FarcasterSignType as SignType, Source } from '@/constants/enum.js';
import { AbortError, FarcasterProfileNotConnectedError, TimeoutError } from '@/constants/error.js';
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
    const [profileError, setProfileError] = useState<FarcasterProfileNotConnectedError | null>(null);

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

                        if (IS_MOBILE_DEVICE) {
                            resetCountdown();
                            startCountdown();
                        }
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
                    setProfileError(null);

                    if (!account.session.token) {
                        setProfileError(
                            new FarcasterProfileNotConnectedError(
                                account.profile,
                                t`You didn't connect with Firefly before, need to connect first to fully log in.`,
                            ),
                        );
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
                <div className="relative flex w-full flex-col items-center gap-4">
                    {profileError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            {profileError.profile ? (
                                <div className="mb-4 flex flex-col items-center justify-center">
                                    <ProfileAvatar
                                        className="mb-2"
                                        profile={profileError.profile}
                                        size={64}
                                        enableSourceIcon={false}
                                    />
                                    <p className="text-base">{profileError.profile.displayName}</p>
                                    <p className="text-xs">@{profileError.profile.handle}</p>
                                </div>
                            ) : null}
                            <p className="mb-[80px] max-w-[300px] text-sm">{profileError.message}</p>
                            <ClickableButton
                                className="rounded-md border border-main bg-main px-4 py-1 text-primaryBottom"
                                onClick={() => {
                                    setScanned(false);
                                    setProfileError(null);
                                    resetCountdown();
                                }}
                            >
                                <Trans>Back</Trans>
                            </ClickableButton>
                        </div>
                    ) : url ? (
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

                                    switch (signType) {
                                        case SignType.GrantPermission:
                                            onLoginByGrantPermission();
                                            break;
                                        case SignType.RelayService:
                                            resetCountdown();
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
                                        <br /> Approve the{' '}
                                        <Link
                                            to={`/farcaster?signType=${SignType.RelayService}`}
                                            className="font-bold hover:underline"
                                        >
                                            existing Farcaster signer
                                        </Link>{' '}
                                        to Firefly
                                    </Trans>
                                ) : signType === SignType.RelayService ? (
                                    <Trans>
                                        Never login on Firefly?
                                        <br />
                                        Approve{' '}
                                        <Link
                                            to={`/farcaster?signType=${SignType.GrantPermission}`}
                                            className="font-bold hover:underline"
                                        >
                                            a new Farcaster signer
                                        </Link>{' '}
                                        to Firefly
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
