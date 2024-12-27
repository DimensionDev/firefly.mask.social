'use client';

import { exposeToIframe } from '@farcaster/frame-host';
import { Trans } from '@lingui/macro';
import { useEffect, useRef, useState } from 'react';
import { useAsyncRetry } from 'react-use';

import { FramePage, FramePageBody, FramePageTitle } from '@/app/(whiteboard)/components/FramePage.js';
import FireflyLogo from '@/assets/firefly.logo.svg';
import GhostHoleIcon from '@/assets/ghost.svg';
import { IS_DEVELOPMENT } from '@/constants/index.js';
import { bom } from '@/helpers/bom.js';
import { createEIP1193ProviderFromRequest, type RequestArguments } from '@/helpers/createEIP1193Provider.js';
import { parseJSON } from '@/helpers/parseJSON.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { FarcasterFrameHost } from '@/providers/frame/Host.js';
import { SupportedMethod } from '@/types/bridge.js';
import type { FrameV2, FrameV2Host } from '@/types/frame.js';

interface PageProps {
    searchParams: {};
}

export default function Page({ searchParams }: PageProps) {
    const [ready, setReady] = useState(false);
    const { loading, retry, error, value } = useAsyncRetry(async () => {
        if (!fireflyBridgeProvider.supported) return;

        const result = await fireflyBridgeProvider.request(SupportedMethod.GET_FRAME_CONTEXT, {});
        const context = {
            user: result.user,
            location: result.location,
            client: {
                clientFid: 0,
                added: false,
                ...result.client,
            },
        };

        return {
            url: result.frame.originalUrl,
            frame: result.frame.content,
            frameHost: new FarcasterFrameHost(context, {
                ready: () => setReady(true),
                close: () => fireflyBridgeProvider.request(SupportedMethod.CLOSE, {}),
                setPrimaryButton: (options) =>
                    fireflyBridgeProvider.request(SupportedMethod.SET_PRIMARY_BUTTON, options),
            }),
        } satisfies {
            url: string;
            frame: FrameV2;
            frameHost: FrameV2Host;
        };
    }, [setReady]);

    const frameRef = useRef<HTMLIFrameElement | null>(null);
    const { frame, frameHost } = value ?? {};

    useEffect(() => {
        if (!fireflyBridgeProvider.supported) return;
        if (!frameRef.current) return;
        if (!frameHost) return;

        const result = exposeToIframe({
            debug: IS_DEVELOPMENT,
            iframe: frameRef.current,
            sdk: frameHost,
            ethProvider: createEIP1193ProviderFromRequest(async function request<T>(
                requestArguments: RequestArguments,
            ) {
                const result = await fireflyBridgeProvider.request(SupportedMethod.REQUEST, requestArguments);
                return result as T;
            }),
            frameOrigin: '*',
        });

        return () => {
            result?.cleanup();
        };
    }, [frame, frameHost]);

    const onReload = () => {
        if (fireflyBridgeProvider.supported) retry();
        else bom.location?.reload();
    };

    const onClose = () => {
        if (fireflyBridgeProvider.supported) fireflyBridgeProvider.request(SupportedMethod.CLOSE, {});
        else bom.window?.close();
    };

    if (!fireflyBridgeProvider.supported || error) {
        return (
            <FramePage>
                <FramePageTitle onClose={onClose} onReload={onReload}>
                    Firefly
                </FramePageTitle>
                <FramePageBody>
                    <div className="flex flex-col items-center">
                        <GhostHoleIcon width={200} height={143} className="text-third" />
                        <p className="mt-10 text-center text-sm">
                            {error?.message ?? <Trans>Your browser does not support the Firefly Bridge.</Trans>}
                        </p>
                    </div>
                </FramePageBody>
            </FramePage>
        );
    }

    return (
        <FramePage>
            <FramePageTitle onClose={onClose} onReload={onReload}>
                {frame ? frame.button.action.name : null}
            </FramePageTitle>
            <FramePageBody>
                {frame ? (
                    <iframe
                        className="scrollbar-hide h-full w-full opacity-100"
                        ref={frameRef}
                        src={frame.button.action.url}
                        allow="clipboard-write 'src'"
                        sandbox="allow-forms allow-scripts allow-same-origin"
                        style={{
                            backgroundColor: frame.button.action.splashBackgroundColor,
                        }}
                    />
                ) : null}
                {!ready || loading || !frame ? (
                    <div className="absolute inset-0 top-[60px] flex items-center justify-center bg-white dark:bg-black">
                        <FireflyLogo width={80} height={80} />
                    </div>
                ) : null}
            </FramePageBody>
        </FramePage>
    );
}
