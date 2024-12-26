'use client';

import { IS_DEVELOPMENT } from '@/constants/index.js';
import { createEIP1193Provider } from '@/helpers/createEIP1193Provider.js';
import type { Frame, FrameV2, FrameV2Host } from '@/types/frame.js';
import { exposeToIframe, type FrameHost } from '@farcaster/frame-host';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { useAsyncRetry, useAsyncFn } from 'react-use';
import FireflyLogo from '@/assets/firefly.logo.svg';

interface PageProps {
    searchParams: {};
}

export default function Page({ searchParams }: PageProps) {
    const [ready, setReady] = useState(false);
    const { loading, retry, value } = useAsyncRetry(async () => {
        return Promise.resolve<{
            frame: FrameV2;
            frameHost: FrameV2Host;
        }>(null!);
    }, [setReady]);

    const frameRef = useRef<HTMLIFrameElement | null>(null);
    const { frame, frameHost } = value ?? {};

    useEffect(() => {
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
    }, [value]);

    return (
        <div className=" ">
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
            {!ready || loading ? (
                <div className="absolute inset-0 top-[60px] flex items-center justify-center bg-white dark:bg-black">
                    <FireflyLogo width={80} height={80} />
                </div>
            ) : null}
        </div>
    );
}
