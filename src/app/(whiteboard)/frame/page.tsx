'use client';

import { exposeToIframe, type ReadyOptions } from '@farcaster/frame-host';
import { Trans } from '@lingui/macro';
import { useEffect, useRef, useState } from 'react';
import { useAsyncRetry } from 'react-use';

import { FramePage, FramePageBody, FramePageTitle } from '@/app/(whiteboard)/components/FramePage.js';
import { GhostError } from '@/app/(whiteboard)/components/GhostError.js';
import FireflyLogo from '@/assets/firefly.logo.svg';
import { IS_DEVELOPMENT } from '@/constants/index.js';
import { bom } from '@/helpers/bom.js';
import { createEIP1193Provider } from '@/helpers/createEIP1193Provider.js';
import { useFireflyBridgeSupported } from '@/hooks/useFireflyBridgeSupported.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { FarcasterFrameHost } from '@/providers/frame/Host.js';
import { SupportedMethod } from '@/types/bridge.js';
import type { RequestArguments } from '@/types/ethereum.js';
import type { FrameV2, FrameV2Host } from '@/types/frame.js';

interface PageProps {
    searchParams: {};
}

export default function Page({ searchParams }: PageProps) {
    const [ready, setReady] = useState(false);

    const { loading: loadingSupported, value: supported = false } = useFireflyBridgeSupported();

    const { loading, retry, error, value } = useAsyncRetry(async () => {
        if (!supported) return;

        const result = await fireflyBridgeProvider.request(SupportedMethod.GET_FRAME_CONTEXT, {});
        const context = {
            user: result.user,
            location: result.location,
            client: {
                clientFid: result.user.fid,
                added: false,
                ...result.client,
            },
        };

        return {
            url: result.frame.originalUrl,
            frame: result.frame.content,
            frameHost: new FarcasterFrameHost(context, {
                ready: (options?: Partial<ReadyOptions>) => {
                    if (options) {
                        fireflyBridgeProvider.request(SupportedMethod.SET_FRAME_READY_OPTIONS, options);
                    }
                    setReady(true);
                },
                close: () => fireflyBridgeProvider.request(SupportedMethod.CLOSE, {}),
                setPrimaryButton: (options) =>
                    fireflyBridgeProvider.request(SupportedMethod.SET_PRIMARY_BUTTON, options),
            }),
        } satisfies {
            url: string;
            frame: FrameV2;
            frameHost: FrameV2Host;
        };
    }, [supported]);

    const frameRef = useRef<HTMLIFrameElement | null>(null);
    const { frame, frameHost } = value ?? {};

    useEffect(() => {
        if (!supported) return;
        if (!frameRef.current) return;
        if (!frameHost) return;

        const result = exposeToIframe({
            debug: IS_DEVELOPMENT,
            iframe: frameRef.current,
            sdk: frameHost,
            ethProvider: createEIP1193Provider(async function request<T>(requestArguments: RequestArguments) {
                const result = await fireflyBridgeProvider.request(SupportedMethod.REQUEST, requestArguments);
                return result as T;
            }),
            frameOrigin: '*',
        });

        return () => {
            result?.cleanup();
        };
    }, [supported, frame, frameHost]);

    const onReload = () => {
        if (supported) retry();
        else bom.location?.reload();
    };

    const onClose = () => {
        if (supported) fireflyBridgeProvider.request(SupportedMethod.CLOSE, {});
        else bom.window?.close();
    };

    if ((!loadingSupported && !supported) || error) {
        return (
            <FramePage>
                <FramePageTitle frame={frame} onClose={onClose} onReload={onReload}>
                    Firefly
                </FramePageTitle>
                <FramePageBody>
                    <GhostError
                        error={error}
                        fallback={<Trans>Your browser does not support the Firefly Bridge.</Trans>}
                    />
                </FramePageBody>
            </FramePage>
        );
    }

    return (
        <FramePage>
            <FramePageTitle frame={frame} onClose={onClose} onReload={onReload}>
                {frame ? frame.button.action.name : <Trans>Loading...</Trans>}
            </FramePageTitle>
            <FramePageBody>
                {!ready || loading || loadingSupported ? (
                    <div className="absolute inset-0 z-10 flex h-full w-full items-center justify-center bg-white dark:bg-black">
                        <FireflyLogo width={80} height={80} />
                    </div>
                ) : null}
                {frame ? (
                    <iframe
                        className="scrollbar-hide absolute inset-0 z-0 h-full w-full opacity-100"
                        ref={frameRef}
                        src={frame.button.action.url}
                        allow="clipboard-write 'src'"
                        sandbox="allow-forms allow-scripts allow-same-origin"
                        style={{
                            backgroundColor: frame.button.action.splashBackgroundColor,
                        }}
                    />
                ) : (
                    <GhostError error={error} fallback={<Trans>No frame found.</Trans>} />
                )}
            </FramePageBody>
        </FramePage>
    );
}
