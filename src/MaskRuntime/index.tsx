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
import { memo, type PropsWithChildren, Suspense, use } from 'react';
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

export const Runtime = memo(function Runtime({ children }: PropsWithChildren<{}>) {
    use(promise);

    const account = useAccount();
    return (
        <DisableShadowRootContext.Provider value>
            <DialogStackingProvider hasGlobalBackdrop={false}>
                <StyledEngineProvider injectFirst>
                    <MaskThemeProvider useMaskIconPalette={(theme) => theme.palette.mode} useTheme={useMaskTheme}>
                        <I18nextProvider i18n={i18NextInstance}>
                            <RootWeb3ContextProvider enforceEVM>
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
    );
});

export default function MaskRuntime({ children }: PropsWithChildren<{}>) {
    return (
        <Suspense fallback={null}>
            <Runtime>{children}</Runtime>
        </Suspense>
    );
}
