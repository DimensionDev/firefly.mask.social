'use client';

import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { LivepeerConfig } from '@livepeer/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { SnackbarProvider } from 'notistack';
import { useEffect, useMemo } from 'react';
import { useEffectOnce } from 'react-use';
import { useMediaQuery } from 'usehooks-ts';
import { v4 as uuid } from 'uuid';
import Bowser from 'bowser';

import { WagmiProvider } from '@/components/WagmiProvider.js';
import { livepeerClient } from '@/configs/livepeerClient.js';
import { queryClient } from '@/configs/queryClient.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
import { DarkModeContext } from '@/hooks/useDarkMode.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useMounted } from '@/hooks/useMounted.js';
import { setLocale } from '@/i18n/index.js';
import { useLeafwatchPersistStore } from '@/store/useLeafwatchPersistStore.js';
import { useThemeModeStore } from '@/store/useThemeModeStore.js';
import { Trans } from '@lingui/macro';
import { Link } from '@/esm/Link.js';

export function Providers(props: { children: React.ReactNode }) {
    const isDarkOS = useMediaQuery('(prefers-color-scheme: dark)');
    const themeMode = useThemeModeStore.use.themeMode();

    const isMedium = useIsMedium();

    const darkModeContext = useMemo(() => {
        return {
            isDarkMode: themeMode === 'dark' || (themeMode === 'default' && isDarkOS),
        };
    }, [isDarkOS, themeMode]);

    useEffect(() => {
        if (darkModeContext.isDarkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [darkModeContext.isDarkMode]);

    useEffect(() => {
        setLocale(getLocaleFromCookies());
    }, []);

    const viewerId = useLeafwatchPersistStore.use.viewerId();
    const setViewerId = useLeafwatchPersistStore.use.setViewerId();

    useEffectOnce(() => {
        if (!viewerId) setViewerId(uuid());
    });

    useEffectOnce(() => {
        if ('serviceWorker' in navigator) {
            (navigator.serviceWorker as ServiceWorkerContainer).register('/sw.js', { scope: '/' }).catch(console.error);
        }
    });

    const isValidBrowser = useMemo(() => {
        if (!navigator) return;

        const browser = Bowser.getParser(navigator.userAgent);
        return browser.satisfies({
            macos: {
                safari: '>=16',
            },
            mobile: {
                safari: '>=16',
                'android browser': '>103',
            },

            // or in general
            chrome: '>=103',
            firefox: '>=100',
            opera: '>=89',
            edge: '>=103',
        });
    }, []);

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
                                    {!isValidBrowser ? (
                                        <div className="fixed left-0 top-0 z-[9999] flex w-full justify-center bg-[#8E96FF] py-[10px] text-[15px] leading-[24px] lg:hidden">
                                            <Trans>
                                                Please use{' '}
                                                <Link
                                                    className="mx-1 font-bold text-[#9250FF]"
                                                    target="_blank"
                                                    rel="noreferrer noopener"
                                                    href="https://www.google.com/chrome/"
                                                >
                                                    Chrome
                                                </Link>
                                                or
                                                <Link
                                                    className="mx-1 font-bold text-[#9250FF]"
                                                    href="https://firefly.land/#download"
                                                    target="_blank"
                                                    rel="noreferrer noopener"
                                                >
                                                    download
                                                </Link>
                                                our app to explore
                                            </Trans>
                                        </div>
                                    ) : null}
                                    {props.children}
                                </LivepeerConfig>
                            </WagmiProvider>
                        </SnackbarProvider>
                    </DarkModeContext.Provider>
                </ReactQueryStreamedHydration>
                {process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_MASK_WEB_COMPONENTS === 'enabled' ? (
                    <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
                ) : null}
            </QueryClientProvider>
        </I18nProvider>
    );
}
