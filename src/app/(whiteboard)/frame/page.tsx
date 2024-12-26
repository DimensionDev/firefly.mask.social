'use client';

import { exposeToIframe } from '@farcaster/frame-host';
import { Trans } from '@lingui/macro';
import { useEffect, useRef, useState } from 'react';
import { useAsyncRetry } from 'react-use';

import FireflyLogo from '@/assets/firefly.logo.svg';
import GhostHoleIcon from '@/assets/ghost.svg';
import { IS_DEVELOPMENT } from '@/constants/index.js';
import { createEIP1193Provider } from '@/helpers/createEIP1193Provider.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import type { FrameV2, FrameV2Host } from '@/types/frame.js';
import { FramePage, FramePageBody, FramePageTitle } from '@/app/(whiteboard)/components/FramePage.js';
import { noop } from 'lodash-es';

interface PageProps {
    searchParams: {};
}

export default function Page({ searchParams }: PageProps) {
    const [ready, setReady] = useState(false);
    const { loading, retry, value } = useAsyncRetry(async () => {
        if (!fireflyBridgeProvider.supported) return;

        return Promise.resolve<{
            frame: FrameV2;
            frameHost: FrameV2Host;
        }>(null!);
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
            ethProvider: createEIP1193Provider(),
            frameOrigin: '*',
        });

        return () => {
            result?.cleanup();
        };
    }, [frame, frameHost]);

    if (!fireflyBridgeProvider.supported) {
        return (
            <FramePage>
                <FramePageTitle onClose={noop} onReload={noop}>
                    <Trans>Not Available</Trans>
                </FramePageTitle>
                <FramePageBody>
                    <p className="mt-10 text-sm">
                        <Trans>Your browser does not support the Firefly Bridge.</Trans>
                    </p>
                </FramePageBody>
            </FramePage>
        );
    }

    return (
        <FramePage>
            <FramePageTitle onClose={noop} onReload={noop}>
                {frame ? <Trans>{frame.button.action.name}</Trans> : null}
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
