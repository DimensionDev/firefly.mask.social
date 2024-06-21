import { plural, t, Trans } from '@lingui/macro';
import { useRef, useState } from 'react';
import { useAsyncFn, useMount, useUnmount } from 'react-use';
import { useCountdown } from 'usehooks-ts';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ScannableQRCode } from '@/components/ScannableQRCode.js';
import { IS_MOBILE_DEVICE } from '@/constants/bowser.js';
import { NODE_ENV, Source } from '@/constants/enum.js';
import { AbortError, MalformedError, ProfileNotConnectedError, TimeoutError } from '@/constants/error.js';
import { FIREFLY_SCAN_QR_CODE_COUNTDOWN } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage, enqueueInfoMessage } from '@/helpers/enqueueMessage.js';
import { getMobileDevice } from '@/helpers/getMobileDevice.js';
import { openAppSchemes } from '@/helpers/openAppSchemes.js';
import { parseURL } from '@/helpers/parseURL.js';
import { FireflySessionConfirmModalRef, LoginModalRef } from '@/modals/controls.js';
import { createSessionByGrantPermission } from '@/providers/firefly/createSessionByGrantPermission.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import { syncSessionFromFirefly } from '@/services/syncSessionFromFirefly.js';
import { DeviceType } from '@/types/device.js';

async function login(createSession: () => Promise<FireflySession>, options?: { signal?: AbortSignal }) {
    try {
        const session = await createSession();
        await FireflySession.restore(session);
        await FireflySessionConfirmModalRef.openAndWaitForClose({
            source: Source.Firefly,
            sessions: await syncSessionFromFirefly(options?.signal),
            onDetected(profiles) {
                if (!profiles.length)
                    enqueueInfoMessage(t`No device accounts detected.`, {
                        environment: NODE_ENV.Development,
                    });
                LoginModalRef.close();
            },
        });
    } catch (error) {
        // skip if the error is abort error
        if (AbortError.is(error)) return;

        // if login timed out, let the user refresh the QR code
        if (error instanceof TimeoutError) return;

        LoginModalRef.close();
        throw error;
    }
}

interface LoginFireflyProps {}

export function LoginFirefly(props: LoginFireflyProps) {
    const controllerRef = useRef<AbortController>();

    const [url, setUrl] = useState('');
    const [scanned, setScanned] = useState(false);
    const [profileError, setProfileError] = useState<ProfileNotConnectedError | null>(null);

    const [count, { startCountdown, resetCountdown }] = useCountdown({
        countStart: FIREFLY_SCAN_QR_CODE_COUNTDOWN,
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
                    createSessionByGrantPermission(async (url) => {
                        resetCountdown();
                        startCountdown();
                        setScanned(false);

                        const device = getMobileDevice();
                        if (device === 'unknown') {
                            setUrl(url);
                            return;
                        }

                        const parsedUrl = parseURL(url);
                        const sessionId = parsedUrl?.searchParams.get('session');
                        if (!sessionId) throw new MalformedError(`Invalid url = ${url}`);

                        await openAppSchemes({
                            [DeviceType.IOS]: url.replace(/^https/, 'firefly'),
                            [DeviceType.Android]: `firefly://LoginToDesktop/ConfirmDialog?session=${sessionId}`,
                        });
                    }, controllerRef.current?.signal),
                {
                    signal: controllerRef.current.signal,
                },
            );
        } catch (error) {
            enqueueErrorMessage(t`Failed to login.`, {
                error,
            });
            throw error;
        }
    }, [resetCountdown, startCountdown]);

    useMount(() => {
        onLoginByGrantPermission();
    });

    useUnmount(() => {
        controllerRef.current?.abort(new AbortError());
    });

    return (
        <div className="flex flex-col rounded-[12px] md:w-[600px]">
            {IS_MOBILE_DEVICE ? (
                <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-4 p-4">
                    <LoadingIcon className="animate-spin" width={24} height={24} />
                    <div className="mt-2 text-center text-sm leading-[16px] text-lightSecond">
                        <Trans>Please confirm the login with Firefly.</Trans>
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
                                ) : (
                                    <Trans>
                                        On your mobile device with <span className="font-bold">Firefly</span>, open the{' '}
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
                                className={classNames('relative flex items-center justify-center', {
                                    'cursor-pointer': !scanned,
                                })}
                                onClick={() => {
                                    if (scanned) return;

                                    controllerRef.current?.abort(new AbortError());

                                    onLoginByGrantPermission();
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
