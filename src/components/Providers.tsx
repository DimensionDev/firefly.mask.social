'use client';

import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { LivepeerConfig } from '@livepeer/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { usePathname } from 'next/navigation.js';
import { SessionProvider } from 'next-auth/react';
import { SnackbarProvider } from 'notistack';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useEffectOnce } from 'react-use';
import { v4 as uuid } from 'uuid';

import { WagmiProvider } from '@/components/WagmiProvider.js';
import { livepeerClient } from '@/configs/livepeerClient.js';
import { queryClient } from '@/configs/queryClient.js';
import { sentryClient } from '@/configs/sentryClient.js';
import { NODE_ENV, STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
import { DarkModeContext } from '@/hooks/useDarkMode.js';
import { useIsDarkMode } from '@/hooks/useIsDarkMode.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useMounted } from '@/hooks/useMounted.js';
import { setLocale } from '@/i18n/index.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useLeafwatchPersistStore } from '@/store/useLeafwatchPersistStore.js';

export function Providers(props: { children: React.ReactNode }) {
    const isDarkMode = useIsDarkMode();
    const isMedium = useIsMedium();

    const darkModeContext = useMemo(() => {
        return {
            isDarkMode,
        };
    }, [isDarkMode]);

    const entryPathname = useRef('');
    const pathname = usePathname();

    useLayoutEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    useLayoutEffect(() => {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) return;
        meta.setAttribute('content', isDarkMode ? '#030303' : '#ffffff');
    }, [isDarkMode]);

    useEffect(() => {
        setLocale(getLocaleFromCookies());
    }, []);

    const viewerId = useLeafwatchPersistStore.use.viewerId();
    const setViewerId = useLeafwatchPersistStore.use.setViewerId();

    useEffectOnce(() => {
        sentryClient.init();
    });

    useEffectOnce(() => {
        if (!viewerId) setViewerId(uuid());
    });

    useEffectOnce(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(console.error);
        }
    });

    useEffect(() => {
        if (!entryPathname.current || pathname === entryPathname.current) {
            entryPathname.current = pathname;
            return;
        }

        useGlobalState.setState((state) => {
            return {
                ...state,
                routeChanged: true,
            };
        });
    }, [pathname]);

    const mounted = useMounted();
    if (!mounted) return null;

    return (
        <I18nProvider i18n={i18n}>
            {/* We are using @tanstack/react-query@5.8.7 */}
            <QueryClientProvider client={queryClient}>
                <ReactQueryStreamedHydration>
                    <DarkModeContext.Provider value={darkModeContext}>
                        <SnackbarProvider
                            maxSnack={30}
                            anchorOrigin={{ vertical: 'top', horizontal: isMedium ? 'right' : 'center' }}
                            autoHideDuration={3000}
                            classes={{
                                containerAnchorOriginTopCenter: isMedium ? undefined : 'px-2',
                            }}
                        >
                            {/* wagmi depends @tanstack/react-query@4.29.23 */}
                            <WagmiProvider>
                                {/* livepeer depends @tanstack/react-query@4.36.1 */}
                                <LivepeerConfig client={livepeerClient}>
                                    <SessionProvider>{props.children}</SessionProvider>
                                </LivepeerConfig>
                            </WagmiProvider>
                        </SnackbarProvider>
                    </DarkModeContext.Provider>
                </ReactQueryStreamedHydration>
                {env.shared.NODE_ENV === NODE_ENV.Development &&
                env.external.NEXT_PUBLIC_MASK_WEB_COMPONENTS === STATUS.Enabled ? (
                    <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
                ) : null}
            </QueryClientProvider>
        </I18nProvider>
    );
}
