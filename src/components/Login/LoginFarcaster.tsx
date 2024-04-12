'use client';

import { Trans } from '@lingui/macro';
import { useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { useAsyncFn, useEffectOnce, useUnmount } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { config } from '@/configs/wagmiClient.js';
import { IS_PRODUCTION } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { getMobileDevice } from '@/helpers/getMobileDevice.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { createSessionByCustodyWallet } from '@/providers/warpcast/createSessionByCustodyWallet.js';
import { createSessionByGrantPermission } from '@/providers/warpcast/createSessionByGrantPermission.js';
import { login } from '@/providers/warpcast/login.js';

const isMobileDevice = getMobileDevice() !== 'unknown';

export function LoginFarcaster() {
    const [url, setUrl] = useState('');
    const controllerRef = useRef<AbortController>();

    const [{ loading: loadingGrantPermission, error: errorGrantPermission }, onLoginWithGrantPermission] =
        useAsyncFn(async () => {
            controllerRef.current?.abort();
            controllerRef.current = new AbortController();
            await login(() =>
                createSessionByGrantPermission(
                    (url) => {
                        const device = getMobileDevice();
                        if (device === 'unknown') setUrl(url);
                        else location.href = url;
                    },
                    controllerRef.current?.signal,
                ),
            );
        }, []);

    const [{ loading: loadingCustodyWallet }, onLoginWithCustodyWallet] = useAsyncFn(async () => {
        if (controllerRef.current) controllerRef.current.abort();
        await login(async () => {
            const client = await getWalletClientRequired(config);
            return createSessionByCustodyWallet(client);
        });
    }, []);

    useEffectOnce(() => {
        onLoginWithGrantPermission();
    });

    useUnmount(() => {
        controllerRef.current?.abort();
    });

    return (
        <div
            className="flex flex-col rounded-[12px] md:w-[600px]"
            style={{ boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)' }}
        >
            {isMobileDevice ? (
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
                                <Trans>
                                    On your mobile device with Warpcast, open the{' '}
                                    <span className="font-bold">Camera</span> app and scan the QR code.
                                </Trans>
                            </div>
                            <div
                                className=" relative flex cursor-pointer items-center justify-center"
                                onClick={onLoginWithGrantPermission}
                            >
                                <QRCode
                                    className={classNames({
                                        'blur-md': !!errorGrantPermission,
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
