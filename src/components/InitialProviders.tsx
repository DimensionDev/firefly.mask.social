'use client';

import { useActionsRegistryInterval } from '@dialectlabs/blinks';
import { usePathname } from 'next/navigation.js';
import { SnackbarProvider } from 'notistack';
import { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useEffectOnce } from 'react-use';
import { v4 as uuid } from 'uuid';

import { sentryClient } from '@/configs/sentryClient.js';
import { classNames } from '@/helpers/classNames.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
import { DarkModeContext } from '@/hooks/useDarkMode.js';
import { useIsDarkMode } from '@/hooks/useIsDarkMode.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { setLocale } from '@/i18n/index.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useLeafwatchPersistStore } from '@/store/useLeafwatchPersistStore.js';

export const InitialProviders = memo(function Providers(props: { children: React.ReactNode }) {
    const isDarkMode = useIsDarkMode();
    const isMedium = useIsMedium();
    useActionsRegistryInterval();

    const darkModeContext = useMemo(() => {
        return {
            isDarkMode,
        };
    }, [isDarkMode]);

    const entryPathname = useRef('');
    const pathname = usePathname();

    useLayoutEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);

        const meta = document.querySelector('meta[name="theme-color"]');
        meta?.setAttribute('content', isDarkMode ? '#030303' : '#ffffff');
    }, [isDarkMode]);

    useEffect(() => {
        const locale = getLocaleFromCookies();
        console.info('set locale =', locale);
        setLocale(getLocaleFromCookies());
    }, []);

    const viewerId = useLeafwatchPersistStore.use.viewerId();
    const setViewerId = useLeafwatchPersistStore.use.setViewerId();

    useEffectOnce(() => {
        sentryClient.init();

        if (!viewerId) setViewerId(uuid());

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

    return (
        <DarkModeContext.Provider value={darkModeContext}>
            <SnackbarProvider
                maxSnack={30}
                anchorOrigin={{ vertical: 'top', horizontal: isMedium ? 'right' : 'center' }}
                autoHideDuration={3000}
                classes={{
                    containerAnchorOriginTopCenter: isMedium ? undefined : 'px-2',
                    variantInfo: classNames('!bg-warn'),
                }}
            >
                {props.children}
            </SnackbarProvider>
        </DarkModeContext.Provider>
    );
});
