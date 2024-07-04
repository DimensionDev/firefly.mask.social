'use client';

import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { plural, t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import { useAsyncFn, useUnmount } from 'react-use';
import { useCountdown } from 'usehooks-ts';
import { UserRejectedRequestError } from 'viem';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ScannableQRCode } from '@/components/ScannableQRCode.js';
import { IS_MOBILE_DEVICE } from '@/constants/bowser.js';
import { FarcasterSignType, Source } from '@/constants/enum.js';
import { AbortError, NotImplementedError, ProfileNotConnectedError, TimeoutError } from '@/constants/error.js';
import { FARCASTER_REPLY_COUNTDOWN, IS_PRODUCTION } from '@/constants/index.js';
import { type AccountOptions, addAccount } from '@/helpers/account.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getMobileDevice } from '@/helpers/getMobileDevice.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { isSameSession } from '@/helpers/isSameSession.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useAbortController } from '@/hooks/useAbortController.js';
import { LoginModalRef } from '@/modals/controls.js';
import type { Account } from '@/providers/types/Account.js';
import { createAccountByGrantPermission } from '@/providers/warpcast/createAccountByGrantPermission.js';
import { createAccountByRelayService } from '@/providers/warpcast/createAccountByRelayService.js';
import { syncAccountsFromFirefly } from '@/services/syncAccountsFromFirefly.js';

async function login(createAccount: () => Promise<Account>, options?: Omit<AccountOptions, 'source'>) {
    try {
        const succeed = await addAccount(await createAccount(), {
            source: Source.Farcaster,
            ...options,
        });

        if (succeed) enqueueSuccessMessage(t`Your ${resolveSourceName(Source.Farcaster)} account is now connected.`);
        LoginModalRef.close();
    } catch (error) {
        // skip if the error is abort error
        if (AbortError.is(error)) return;

        // if login timed out, let the user refresh the QR code
        if (error instanceof TimeoutError) return;

        enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to login`), {
            error,
        });

        // user rejected request
        if (error instanceof UserRejectedRequestError) return;

        // if any error occurs, close the modal
        // by this we don't need to do error handling in UI part.
        LoginModalRef.close();
        throw error;
    }
}

interface LoginFarcasterProps {
    signType: FarcasterSignType | null;
    setSignType: Dispatch<SetStateAction<FarcasterSignType | null>>;
}

export function LoginFarcaster({ signType, setSignType }: LoginFarcasterProps) {
    const options = useMemo(() => {
        return [
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
            {
                label: t`Sign in with Custody Wallet`,
                type: FarcasterSignType.CustodyWallet,
                developmentOnly: true,
                isFreeOfTransactionFee: true,
            },
        ].filter((x) => (IS_PRODUCTION ? !x.developmentOnly : true));
    }, []);

    const controller = useAbortController();

    const [url, setUrl] = useState('');
    const [scanned, setScanned] = useState(false);
    const [profileError, setProfileError] = useState<ProfileNotConnectedError | null>(null);

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
            enqueueErrorMessage(t`Failed to login.`, {
                error,
            });
            throw error;
        }
    }, []);

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

                    // for relay service we need to sync the session from firefly
                    // and find out the the signer key of the connected profile
                    const accounts = await syncAccountsFromFirefly(account.fireflySession, controller.current.signal);

                    // if the user has signed into Firefly before, a synced session could be found.
                    const nextAccount = accounts.find((x) => isSameSession(x.session, account.session));

                    if (!nextAccount) {
                        try {
                            setProfileError(
                                new ProfileNotConnectedError(
                                    account.profile,
                                    t`You didn't connect with Firefly before, need to connect first to fully log in.`,
                                ),
                            );
                        } catch {
                            setProfileError(
                                new ProfileNotConnectedError(
                                    null,
                                    t`You didn't connect with Firefly before, need to connect first to fully log in.`,
                                ),
                            );
                        }

                        throw new AbortError();
                    }

                    return account;
                },
                { skipRestoreFireflyAccounts: true, signal: controller.current.signal },
            );
        } catch (error) {
            enqueueErrorMessage(t`Failed to login.`, {
                error,
            });
            throw error;
        }
    }, [resetCountdown, startCountdown]);

    const [{ loading: loadingCustodyWallet }, onLoginWithCustodyWallet] = useAsyncFn(async () => {
        controller.current.abort();

        try {
            await login(
                async () => {
                    throw new NotImplementedError();
                },
                { signal: controller.current.signal },
            );
        } catch (error) {
            enqueueErrorMessage(t`Failed to login.`, {
                error,
            });
            throw error;
        }
    }, []);

    useUnmount(() => {
        if (IS_MOBILE_DEVICE) resetCountdown();
    });

    if (signType === FarcasterSignType.RecoveryPhrase) return null;

    // step 1: select sign type
    if (!signType || signType === FarcasterSignType.CustodyWallet) {
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
                            setSignType(type);
                            switch (type) {
                                case FarcasterSignType.GrantPermission:
                                    onLoginByGrantPermission();
                                    break;
                                case FarcasterSignType.RelayService:
                                    onLoginByRelayService();
                                    break;
                                case FarcasterSignType.CustodyWallet:
                                    onLoginWithCustodyWallet();
                                    break;
                            }
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
                        {loadingCustodyWallet && type === FarcasterSignType.CustodyWallet ? (
                            <LoadingIcon className="animate-spin" width={24} height={24} />
                        ) : (
                            <ArrowRightIcon width={24} height={24} className="rounded-full p-1 text-main" />
                        )}
                    </ClickableButton>
                ))}
            </div>
        );
    }

    // step 2: display qr code
    return (
        <div className="flex flex-col rounded-[12px] md:w-[600px]">
            {IS_MOBILE_DEVICE ? (
                <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-4 p-4">
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
                <div className="relative flex min-h-[475px] w-full flex-col items-center gap-4 p-4">
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
                                    setSignType(null);
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
                            <div className="text-center text-[12px] leading-[16px] text-lightSecond">
                                {count === 0 ? (
                                    <Trans>Please click and refresh the QR code to log in again.</Trans>
                                ) : signType === FarcasterSignType.GrantPermission ? (
                                    <Trans>
                                        On your mobile device with <span className="font-bold">Warpcast</span>, open the{' '}
                                        <span className="font-bold">Camera</span> app and scan the QR code. Approve a
                                        new Farcaster signer to <span className="font-bold">Firefly</span>.
                                    </Trans>
                                ) : signType === FarcasterSignType.RelayService ? (
                                    <Trans>
                                        On your mobile device with <span className="font-bold">Warpcast</span>, open the{' '}
                                        <span className="font-bold">Camera</span> app and scan the QR code in{' '}
                                        {
                                            <span className="font-bold">
                                                {plural(count, {
                                                    one: '1 second',
                                                    other: `${count} seconds`,
                                                })}
                                            </span>
                                        }
                                        . Approve a new Farcaster signer to <span className="font-bold">Firefly</span>.
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
                                        case FarcasterSignType.GrantPermission:
                                            onLoginByGrantPermission();
                                            break;
                                        case FarcasterSignType.RelayService:
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
                        </>
                    ) : (
                        <div className="flex w-full flex-1 flex-col items-center justify-center">
                            <LoadingIcon className="animate-spin" width={24} height={24} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
