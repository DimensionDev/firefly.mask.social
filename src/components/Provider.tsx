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

import { WagmiProvider } from '@/components/WagmiProvider.js';
import { livepeerClient } from '@/configs/livepeerClient.js';
import { queryClient } from '@/configs/queryClient.js';
import { DarkModeContext } from '@/hooks/useDarkMode.js';
import { useMounted } from '@/hooks/useMounted.js';
import { initLocale } from '@/i18n/index.js';
import { useLeafwatchPersistStore } from '@/store/useLeafwatchPersistStore.js';
import { useThemeModeStore } from '@/store/useThemeModeStore.js';

export function Providers(props: { children: React.ReactNode }) {
    const isDarkOS = useMediaQuery('(prefers-color-scheme: dark)');
    const themeMode = useThemeModeStore.use.themeMode();

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
        initLocale();
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

    const mounted = useMounted();
    if (!mounted) return null;

    return (
        <I18nProvider i18n={i18n}>
            <QueryClientProvider client={queryClient}>
                <ReactQueryStreamedHydration>
                    <DarkModeContext.Provider value={darkModeContext}>
                        <SnackbarProvider
                            maxSnack={30}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            autoHideDuration={3000}
                        >
                            <WagmiProvider>
                                <LivepeerConfig client={livepeerClient}>{props.children}</LivepeerConfig>
                            </WagmiProvider>
                        </SnackbarProvider>
                    </DarkModeContext.Provider>
                </ReactQueryStreamedHydration>
                {process.env.NODE_ENV === 'development' ? <ReactQueryDevtools initialIsOpen={false} /> : null}
            </QueryClientProvider>
        </I18nProvider>
    );
}
