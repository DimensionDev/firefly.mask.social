'use client';

import { setupBuildInfo } from '@masknet/flags/build-info';
import { SharedContextProvider } from '@masknet/shared';
import { i18NextInstance } from '@masknet/shared-base';
import {
    CSSVariableInjector,
    DialogStackingProvider,
    DisableShadowRootContext,
    MaskThemeProvider,
} from '@masknet/theme';
import { ChainContextProvider, RootWeb3ContextProvider } from '@masknet/web3-hooks-base';
import { ChainId } from '@masknet/web3-shared-evm';
import { StyledEngineProvider } from '@mui/material';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { type PersistQueryClientOptions, PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Suspense, use } from 'react';
import { type PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useAccount } from 'wagmi';

import { useMaskTheme } from '@/hooks/useMaskTheme.js';

async function setupRuntime() {
    await setupBuildInfo();
    await import('./storage.js').then(({ initStorage }) => initStorage());
    await import('./wallet.js').then(({ initWallet }) => initWallet());
    await import('./locale.js').then(({ initLocale }) => initLocale());
    await import('../plugin-host/enable.js');
    await import('../background-worker/index.js');
}
const promise = setupRuntime();

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});
const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
    persister: createSyncStoragePersister({
        storage: localStorage,
    }),
    buster: 'v1',
    dehydrateOptions: {
        shouldDehydrateQuery: ({ queryKey }) => {
            if (Array.isArray(queryKey) && String(queryKey[0]).startsWith('@@')) return true;
            return false;
        },
    },
};

export function Runtime({ children }: PropsWithChildren<{}>) {
    use(
        promise.then(() => {
            console.log('setup runtime');
        }),
    );

    const account = useAccount();
    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
            <DisableShadowRootContext.Provider value>
                <DialogStackingProvider hasGlobalBackdrop={false}>
                    <StyledEngineProvider injectFirst>
                        <MaskThemeProvider useMaskIconPalette={(theme) => theme.palette.mode} useTheme={useMaskTheme}>
                            <I18nextProvider i18n={i18NextInstance}>
                                <RootWeb3ContextProvider>
                                    <ChainContextProvider account={account.address} chainId={ChainId.Mainnet}>
                                        <SharedContextProvider>
                                            <Suspense fallback={null}>
                                                <CSSVariableInjector />
                                                {children}
                                            </Suspense>
                                        </SharedContextProvider>
                                    </ChainContextProvider>
                                </RootWeb3ContextProvider>
                            </I18nextProvider>
                        </MaskThemeProvider>
                    </StyledEngineProvider>
                </DialogStackingProvider>
            </DisableShadowRootContext.Provider>
        </PersistQueryClientProvider>
    );
}

export default function MaskRuntime({ children }: PropsWithChildren<{}>) {
    return (
        <Suspense fallback={null}>
            <Runtime>{children}</Runtime>
        </Suspense>
    );
}
