'use client';

import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { plural, t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useMemo, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { useAsyncFn, useUnmount } from 'react-use';
import { useCountdown } from 'usehooks-ts';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { config } from '@/configs/wagmiClient.js';
import { IS_MOBILE_DEVICE } from '@/constants/bowser.js';
import { FarcasterSignType, NODE_ENV, Source } from '@/constants/enum.js';
import { AbortError } from '@/constants/error.js';
import { FARCASTER_REPLY_COUNTDOWN, IS_PRODUCTION } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage, enqueueInfoMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getMobileDevice } from '@/helpers/getMobileDevice.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { isAbortedError } from '@/helpers/isAbortedError.js';
import { restoreProfile } from '@/helpers/restoreProfile.js';
import { FireflySessionConfirmModalRef, LoginModalRef } from '@/modals/controls.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { type Profile, SessionType } from '@/providers/types/SocialMedia.js';
import { createSessionByCustodyWallet } from '@/providers/warpcast/createSessionByCustodyWallet.js';
import { createSessionByGrantPermissionFirefly } from '@/providers/warpcast/createSessionByGrantPermission.js';
import { createSessionByRelayService } from '@/providers/warpcast/createSessionByRelayService.js';
import { syncSessionFromFirefly } from '@/services/syncSessionFromFirefly.js';

class ProfileError extends Error {
    constructor(
        public profile: Profile | null,
        public override message: string,
    ) {
        super(message);
    }
}

async function login(
    createSession: () => Promise<FarcasterSession>,
    options?: { skipSyncSessions?: boolean; signal?: AbortSignal },
) {
    try {
        const session = await createSession();
        const profile = await FarcasterSocialMediaProvider.getProfileById(session.profileId);

        // restore profiles for farcaster
        restoreProfile(profile, [profile], session);
        enqueueSuccessMessage(t`Your Farcaster account is now connected.`);

        // restore profile exclude farcaster
        if (!options?.skipSyncSessions) {
            await FireflySessionConfirmModalRef.openAndWaitForClose({
                source: Source.Farcaster,
                sessions: await syncSessionFromFirefly(options?.signal),
                onDetected(profiles) {
                    if (!profiles.length)
                        enqueueInfoMessage(t`No device accounts detected.`, {
                            environment: NODE_ENV.Development,
                        });
                    LoginModalRef.close();
                },
            });
        } else {
            LoginModalRef.close();
        }
    } catch (error) {
        // skip if the error is abort error
        if (isAbortedError(error)) return;

        const message = error instanceof Error ? error.message : typeof error === 'string' ? error : `${error}`;

        // if login timed out, we will let the user refresh the QR code
        if (message.toLowerCase().includes('farcaster login timed out')) return;

        enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to login`), {
            error,
        });

        // user rejected request
        if (message.toLowerCase().includes('user rejected the request')) return;

        // if any error occurs, close the modal
        // by this we don't need to do error handling in UI part.
        LoginModalRef.close();
        throw error;
    }
}

export function LoginFarcaster() {
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

    const controllerRef = useRef<AbortController>();

    const [url, setUrl] = useState('');
    const [signType, setSignType] = useState<FarcasterSignType | null>(options.length === 1 ? options[0].type : null);

    const [scanned, setScanned] = useState(false);
    const [profileError, setProfileError] = useState<ProfileError | null>(null);
    const [count, { startCountdown, resetCountdown }] = useCountdown({
        countStart: FARCASTER_REPLY_COUNTDOWN,
        intervalMs: 1000,
        countStop: 0,
        isIncrement: false,
    });

    const [, onLoginByGrantPermission] = useAsyncFn(async () => {
        controllerRef.current?.abort(new AbortError());
        controllerRef.current = new AbortController();

        try {
            await login(
                () =>
                    createSessionByGrantPermissionFirefly(
                        (url) => {
                            const device = getMobileDevice();
                            if (device === 'unknown') setUrl(url);
                            else location.href = url;
                        },
                        controllerRef.current?.signal,
                    ),
                { signal: controllerRef.current?.signal },
            );
        } catch (error) {
            enqueueErrorMessage(t`Failed to login.`, {
                error,
            });
            throw error;
        }
    }, []);

    const [, onLoginByRelayService] = useAsyncFn(async () => {
        controllerRef.current?.abort(new AbortError());
        controllerRef.current = new AbortController();

        try {
            await login(
                async () => {
                    const staledSession = fireflySessionHolder.session;

                    const session = await createSessionByRelayService(
                        (url) => {
                            resetCountdown();
                            startCountdown();
                            setScanned(false);

                            const device = getMobileDevice();
                            if (device === 'unknown') setUrl(url);
                            else location.href = url;
                        },
                        controllerRef.current?.signal,
                    );

                    // let the user see the qr code has been scanned and display a loading icon
                    setScanned(true);
                    setProfileError(null);

                    // for relay service we need to sync the session from firefly
                    // and find out the the signer key of the connected profile
                    const sessions = await syncSessionFromFirefly(controllerRef.current?.signal);

                    const restoredSession = sessions.find(
                        (x) => session.type === SessionType.Farcaster && x.profileId === session.profileId,
                    );

                    if (!restoredSession) {
                        // the current profile did not connect to firefly
                        // we need to restore the staled session and keep everything untouched
                        if (staledSession) FireflySession.restore(staledSession);

                        try {
                            const profile = await FarcasterSocialMediaProvider.getProfileById(session.profileId);

                            setProfileError(
                                new ProfileError(
                                    profile,
                                    t`You didn't connect with Firefly before, need to connect first to fully log in.`,
                                ),
                            );
                        } catch {
                            setProfileError(
                                new ProfileError(
                                    null,
                                    t`You didn't connect with Firefly before, need to connect first to fully log in.`,
                                ),
                            );
                        }

                        throw new AbortError();
                    }

                    return restoredSession as FarcasterSession;
                },
                { skipSyncSessions: true, signal: controllerRef.current?.signal },
            );
        } catch (error) {
            enqueueErrorMessage(t`Failed to login.`, {
                error,
            });
            throw error;
        }
    }, [resetCountdown, startCountdown]);

    const [{ loading: loadingCustodyWallet }, onLoginWithCustodyWallet] = useAsyncFn(async () => {
        controllerRef.current?.abort(new AbortError());
        try {
            await login(
                async () => {
                    const client = await getWalletClientRequired(config);
                    return createSessionByCustodyWallet(client);
                },
                { signal: controllerRef.current?.signal },
            );
        } catch (error) {
            enqueueErrorMessage(t`Failed to login.`, {
                error,
            });
            throw error;
        }
    }, []);

    useUnmount(() => {
        controllerRef.current?.abort(new AbortError());
    });

    if (signType === FarcasterSignType.RecoveryPhrase) return null;

    // step 1: select sign type
    if (!signType || signType === FarcasterSignType.CustodyWallet) {
        return (
            <div className="flex flex-col gap-2 rounded-[12px] p-4 md:w-[600px]">
                <p className=" pb-2 text-left text-sm">
                    <Trans>You can sign in to Farcaster with the following options.</Trans>
                </p>
                {options.map(({ label, type, isFreeOfTransactionFee }) => (
                    <ClickableButton
                        className=" flex w-full items-center rounded-lg border border-line px-3 py-4 text-main hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50"
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
                        <span className=" flex flex-1 items-center">
                            {label}
                            {isFreeOfTransactionFee ? (
                                <span className=" ml-2 rounded-md border border-main px-1 text-xs font-bold text-main">
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
                    <LoadingIcon className="animate-spin" width={24} height={24} />
                    <div className=" mt-2 text-center text-sm leading-[16px] text-lightSecond">
                        <Trans>Please confirm the login with Warpcast.</Trans>
                    </div>
                </div>
            ) : (
                <div className="relative flex min-h-[475px] w-full flex-col items-center gap-4 p-4">
                    {profileError ? (
                        <div className=" absolute inset-0 flex flex-col items-center justify-center">
                            {profileError.profile ? (
                                <div className=" mb-4 flex flex-col items-center justify-center">
                                    <ProfileAvatar
                                        className=" mb-2"
                                        profile={profileError.profile}
                                        size={64}
                                        enableSourceIcon={false}
                                    />
                                    <p className=" text-base">{profileError.profile.displayName}</p>
                                    <p className=" text-xs">@{profileError.profile.handle}</p>
                                </div>
                            ) : null}
                            <p className=" mb-[80px] max-w-[300px] text-sm">{profileError.message}</p>
                            <ClickableButton
                                className=" rounded-md border border-main bg-main px-4 py-1 text-primaryBottom"
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
                            <div className=" text-center text-[12px] leading-[16px] text-lightSecond">
                                {count === 0 ? (
                                    <Trans>Please click and refresh the QR code to log in again.</Trans>
                                ) : signType === FarcasterSignType.GrantPermission ? (
                                    <Trans>
                                        On your mobile device with Warpcast, open the{' '}
                                        <span className="font-bold">Camera</span> app and scan the QR code.
                                    </Trans>
                                ) : signType === FarcasterSignType.RelayService ? (
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
                                ) : null}
                            </div>
                            <div
                                className={classNames(' relative flex items-center justify-center', {
                                    'cursor-pointer': !scanned,
                                })}
                                onClick={() => {
                                    if (scanned) return;

                                    controllerRef.current?.abort(new AbortError());

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
                                <QRCode
                                    className={classNames({
                                        'blur-md': count === 0 || scanned,
                                    })}
                                    value={url}
                                    size={360}
                                />
                                {scanned ? (
                                    <div className=" absolute inset-0 flex flex-col items-center justify-center">
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
