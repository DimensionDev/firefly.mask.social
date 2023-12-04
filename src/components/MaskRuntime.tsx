'use client';

import { SharedContextProvider } from '@masknet/shared';
import { i18NextInstance } from '@masknet/shared-base';
import {
    CSSVariableInjector,
    DialogStackingProvider,
    DisableShadowRootContext,
    MaskThemeProvider,
} from '@masknet/theme';
import { ChainContextProvider, RootWeb3ContextProvider } from '@masknet/web3-hooks-base';
import { StyledEngineProvider } from '@mui/material';
import { memo, type PropsWithChildren, Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useAccount, useChainId } from 'wagmi';

import { useMaskTheme } from '@/hooks/useMaskTheme.js';

const Runtime = memo(function Runtime({ children }: PropsWithChildren<{}>) {
    const account = useAccount();
    const chainId = useChainId();

    return (
        <DisableShadowRootContext.Provider value>
            <DialogStackingProvider hasGlobalBackdrop={false}>
                <StyledEngineProvider injectFirst>
                    <MaskThemeProvider useMaskIconPalette={(theme) => theme.palette.mode} useTheme={useMaskTheme}>
                        <I18nextProvider i18n={i18NextInstance}>
                            <RootWeb3ContextProvider enforceEVM>
                                <ChainContextProvider account={account.address} chainId={chainId}>
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

export function MaskRuntime({ children }: PropsWithChildren<{}>) {
    return (
        <Suspense fallback={null}>
            <Runtime>{children}</Runtime>
        </Suspense>
    );
}
