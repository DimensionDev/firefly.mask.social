import { plural, t, Trans } from '@lingui/macro';
import { useState } from 'react';
import { useAsyncFn, useMount } from 'react-use';
import { useCountdown } from 'usehooks-ts';

import LoadingIcon from '@/assets/loading.svg';
import { ScannableQRCode } from '@/components/ScannableQRCode.js';
import { IS_MOBILE_DEVICE } from '@/constants/bowser.js';
import { AbortError, MalformedError, TimeoutError } from '@/constants/error.js';
import { FIREFLY_SCAN_QR_CODE_COUNTDOWN } from '@/constants/index.js';
import { addAccount } from '@/helpers/account.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getMobileDevice } from '@/helpers/getMobileDevice.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { openAppSchemes } from '@/helpers/openAppSchemes.js';
import { parseURL } from '@/helpers/parseURL.js';
import { useAbortController } from '@/hooks/useAbortController.js';
import { LoginModalRef } from '@/modals/controls.js';
import { createAccountByGrantPermission } from '@/providers/firefly/createAccountByGrantPermission.js';
import type { Account } from '@/providers/types/Account.js';
import { DeviceType } from '@/types/device.js';

async function login(createAccount: () => Promise<Account>, options?: { signal?: AbortSignal }) {
    try {
        const done = await addAccount(await createAccount(), options);
        if (done) enqueueSuccessMessage(t`Your account is now connected.`);
        LoginModalRef.close();
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
    const controller = useAbortController();

    const [url, setUrl] = useState('');
    const [scanned, setScanned] = useState(false);

    const [count, { startCountdown, resetCountdown }] = useCountdown({
        countStart: FIREFLY_SCAN_QR_CODE_COUNTDOWN,
        intervalMs: 1000,
        countStop: 0,
        isIncrement: false,
    });

    const [, onLoginByGrantPermission] = useAsyncFn(async () => {
        controller.current.renew();

        try {
            await login(
                () =>
                    createAccountByGrantPermission(async (url) => {
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
                        if (!sessionId) throw new MalformedError(`Failed to read session from url = ${url}`);

                        await openAppSchemes({
                            [DeviceType.IOS]: url.replace(/^https/, 'firefly'),
                            [DeviceType.Android]: `firefly://LoginToDesktop/ConfirmDialog?session=${sessionId}`,
                        });
                    }, controller.current.signal),
                {
                    signal: controller.current.signal,
                },
            );
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to login.`), {
                error,
            });
            throw error;
        }
    }, [resetCountdown, startCountdown]);

    useMount(() => {
        onLoginByGrantPermission();
    });

    return (
        <div className="flex flex-col rounded-[12px]">
            {IS_MOBILE_DEVICE ? (
                <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-3">
                    <LoadingIcon className="animate-spin" width={24} height={24} />
                    <div className="mt-2 text-center text-sm leading-[16px] text-lightSecond">
                        <Trans>Please confirm the login with Firefly.</Trans>
                    </div>
                </div>
            ) : (
                <div className="relative flex w-full flex-col items-center gap-3">
                    <div className="text-center text-[12px] leading-[16px] text-lightSecond">
                        <Trans>
                            On your mobile device with <span className="font-bold">Firefly</span>, open the{' '}
                            <span className="font-bold">Camera</span> app and scan the QR code in{' '}
                            <span className="font-mono font-bold">
                                {plural(count, {
                                    one: '1 second',
                                    other: `${count} seconds`,
                                })}
                            </span>
                            .
                        </Trans>
                    </div>
                    {url ? (
                        <div
                            className={classNames('relative flex items-center justify-center', {
                                'cursor-pointer': !scanned,
                            })}
                            onClick={() => {
                                if (scanned) return;
                                controller.current.abort();
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
                    ) : (
                        <div className="h-[270px] w-[270px] rounded-2xl bg-gray-100 dark:bg-gray-800" />
                    )}
                </div>
            )}
        </div>
    );
}
