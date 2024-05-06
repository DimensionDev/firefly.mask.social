'use client';

import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { plural, t, Trans } from '@lingui/macro';
import { useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { useAsyncFn, useEffectOnce, useUnmount } from 'react-use';
import { useCountdown } from 'usehooks-ts';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { config } from '@/configs/wagmiClient.js';
import { IS_MOBILE_DEVICE } from '@/constants/bowser.js';
import { FarcasterSignType } from '@/constants/enum.js';
import { FARCASTER_REPLY_COUNTDOWN, IS_PRODUCTION } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getMobileDevice } from '@/helpers/getMobileDevice.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { restoreProfile } from '@/helpers/restoreProfile.js';
import { FireflySessionConfirmModalRef, LoginModalRef } from '@/modals/controls.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { createSessionByCustodyWallet } from '@/providers/warpcast/createSessionByCustodyWallet.js';
import { createSessionByGrantPermissionFirefly } from '@/providers/warpcast/createSessionByGrantPermission.js';

const USE_GRANT_BY_PERMISSION = true;

interface LoginProps {
    onBack?: () => void;
}

const SIGN_IN_OPTIONS = [
    {
        label: t`Connect with Warpcast`,
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

async function login(createSession: () => Promise<FarcasterSession>) {
    try {
        const session = await createSession();
        const profile = await FarcasterSocialMediaProvider.getProfileById(session.profileId);

        // restore profiles for farcaster
        restoreProfile(profile, [profile], session);
        enqueueSuccessMessage(t`Your Farcaster account is now connected.`);
        LoginModalRef.close();

        // restore profile exclude farcaster
        await FireflySessionConfirmModalRef.openAndWaitForClose();
    } catch (error) {
        // abort error should not be shown to user
        const message = error instanceof Error ? error.message : typeof error === 'string' ? error : `${error}`;
        if (message.toLowerCase().includes('aborted')) return;

        // if login timed out, we will let the user refresh the QR code
        if (message.toLowerCase().includes('farcaster login timed out')) return;

        enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to login`), {
            error,
        });
        // if any error occurs, close the modal
        // by this we don't need to do error handling in UI part.
        LoginModalRef.close();
        throw error;
    }
}

function Login({ onBack }: LoginProps) {
    const [url, setUrl] = useState('');
    const controllerRef = useRef<AbortController>();
    const [count, { startCountdown, resetCountdown }] = useCountdown({
        countStart: FARCASTER_REPLY_COUNTDOWN,
        intervalMs: 1000,
        countStop: 0,
        isIncrement: false,
    });

    const [_, onLoginByRelayService] = useAsyncFn(async () => {
        // reset the process if abort controller is aborted or not initialized
        if (!controllerRef.current || controllerRef.current?.signal.aborted) {
            controllerRef.current = new AbortController();

            try {
                await login(() =>
                    createSessionByGrantPermissionFirefly(
                        (url) => {
                            // for login by relay service, we will use countdown
                            if (!USE_GRANT_BY_PERMISSION) {
                                resetCountdown();
                                startCountdown();
                            }

                            const device = getMobileDevice();
                            if (device === 'unknown') setUrl(url);
                            else location.href = url;
                        },
                        controllerRef.current?.signal,
                    ),
                );
            } catch (error) {
                enqueueErrorMessage(t`Failed to login.`, {
                    error,
                });
                throw error;
            }
        }
    }, [resetCountdown, startCountdown]);

    const [{ loading: loadingCustodyWallet }, onLoginWithCustodyWallet] = useAsyncFn(async () => {
        controllerRef.current?.abort('aborted');
        try {
            await login(async () => {
                const client = await getWalletClientRequired(config);
                return createSessionByCustodyWallet(client);
            });
        } catch (error) {
            enqueueErrorMessage(t`Failed to login.`, {
                error,
            });
            throw error;
        }
    }, []);

    useEffectOnce(() => {
        onLoginByRelayService();
    });

    useUnmount(() => {
        controllerRef.current?.abort('aborted');
    });

    return (
        <div className="flex flex-col rounded-[12px] md:w-[600px]">
            {IS_MOBILE_DEVICE ? (
                <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-4 p-4">
                    <LoadingIcon className="animate-spin" width={24} height={24} />
                    <div className=" mt-2 text-center text-sm leading-[16px] text-lightSecond">
                        <Trans>Please confirm the login with Warpcast.</Trans>
                    </div>
                </div>
            ) : (
                <div className="flex min-h-[475px] w-full flex-col items-center gap-4 p-4 ">
                    {url ? (
                        <>
                            <div className=" text-center text-[12px] leading-[16px] text-lightSecond">
                                {count === 0 ? (
                                    <Trans>Please click and refresh the QR code to log in again.</Trans>
                                ) : USE_GRANT_BY_PERMISSION ? (
                                    <Trans>
                                        On your mobile device with Warpcast, open the{' '}
                                        <span className="font-bold">Camera</span> app and scan the QR code in.
                                    </Trans>
                                ) : (
                                    <Trans>
                                        On your mobile device with Warpcast, open the{' '}
                                        <span className="font-bold">Camera</span> app and scan the QR code in{' '}
                                        {
                                            <span className="font-bold">
                                                {plural(count, {
                                                    one: '1 second',
                                                    other: `${count} seconds`,
                                                })}
                                            </span>
                                        }
                                        .
                                    </Trans>
                                )}
                            </div>
                            <div
                                className=" relative flex cursor-pointer items-center justify-center"
                                onClick={() => {
                                    controllerRef.current?.abort('aborted');
                                    resetCountdown();
                                    onLoginByRelayService();
                                }}
                            >
                                <QRCode
                                    className={classNames({
                                        'blur-md': count === 0,
                                    })}
                                    value={url}
                                    size={360}
                                />
                            </div>
                            {!IS_PRODUCTION ? (
                                <ClickableButton
                                    className="text-sm font-semibold text-lightSecond disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={loadingCustodyWallet}
                                    onClick={onLoginWithCustodyWallet}
                                >
                                    {loadingCustodyWallet ? (
                                        <Trans>Loading...</Trans>
                                    ) : (
                                        <Trans>Login with custody wallet</Trans>
                                    )}
                                </ClickableButton>
                            ) : null}
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

export function LoginFarcaster() {
    const [signType, setSignType] = useState<FarcasterSignType | null>(
        SIGN_IN_OPTIONS.length === 1 ? SIGN_IN_OPTIONS[0].type : null,
    );

    if (!signType) {
        return (
            <div className="flex flex-col gap-2 rounded-[12px] p-4 md:w-[600px]">
                <p className=" pb-2 text-left text-sm">
                    <Trans>You can sign in to Farcaster with the following options.</Trans>
                </p>
                {SIGN_IN_OPTIONS.map(({ label, type, isFreeOfTransactionFee }) => (
                    <ClickableButton
                        className=" flex w-full items-center rounded-lg border border-line p-2 py-4 text-main hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50"
                        key={type}
                        onClick={() => setSignType(type)}
                    >
                        <span className=" flex flex-1 items-center">
                            {label}
                            {isFreeOfTransactionFee ? (
                                <span className=" ml-2 rounded-md border border-lightBottom px-1 text-xs font-bold text-lightBottom">
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

    return <Login onBack={() => setSignType(null)} />;
}
