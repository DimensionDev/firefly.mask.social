'use client';

import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { LivepeerConfig } from '@livepeer/react';
import { getCookie } from '@masknet/shared-base';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { SnackbarProvider } from 'notistack';
import { useEffect, useMemo } from 'react';
import { useEffectOnce } from 'react-use';
import { useMediaQuery } from 'usehooks-ts';
import { v4 as uuid } from 'uuid';

import { MemorizeAccount } from '@/components/MemorizeAccount.js';
import { WagmiProvider } from '@/components/WagmiProvider.js';
import { livepeerClient } from '@/configs/livepeerClient.js';
import { queryClient } from '@/configs/queryClient.js';
import { DarkModeContext } from '@/hooks/useDarkMode.js';
import { useMounted } from '@/hooks/useMounted.js';
import { setLocale } from '@/i18n/index.js';
import { useLeafwatchPersistStore } from '@/store/useLeafwatchPersistStore.js';
import { useThemeModeStore } from '@/store/useThemeModeStore.js';
import type { Locale } from '@/types/index.js';

export function Providers(props: { children: React.ReactNode }) {
    const isDarkOS = useMediaQuery('(prefers-color-scheme: dark)');
    const themeMode = useThemeModeStore.use.themeMode();

    const darkModeContext = useMemo(() => {
        return {
            isDarkMode: themeMode === 'dark' || (themeMode === 'default' && isDarkOS),
        };
    }, [isDarkOS, themeMode]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkModeContext.isDarkMode);
    }, [darkModeContext.isDarkMode]);

    useEffect(() => {
        setLocale(getCookie('locale') as Locale);
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
            {/* We are using @tanstack/react-query@5.8.7 */}
            <QueryClientProvider client={queryClient}>
                <ReactQueryStreamedHydration>
                    <DarkModeContext.Provider value={darkModeContext}>
                        <SnackbarProvider
                            maxSnack={30}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            autoHideDuration={3000}
                            classes={{
                                containerRoot: 'max-w-[400px]',
                            }}
                        >
                            {/* wagmi depends @tanstack/react-query@4.29.23 */}
                            <WagmiProvider>
                                <MemorizeAccount />
                                {/* livepeer depends @tanstack/react-query@4.36.1 */}
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
