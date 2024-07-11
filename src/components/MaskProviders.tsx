'use client';

import { SharedContextProvider } from '@masknet/shared';
import { i18NextInstance } from '@masknet/shared-base';
import {
    CSSVariableInjector,
    DialogStackingProvider,
    DisableShadowRootContext,
    MaskThemeProvider,
    ShadowRootIsolation,
} from '@masknet/theme';
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base';
import { StyledEngineProvider } from '@mui/material';
import { type PropsWithChildren, Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useAccount, useChainId } from 'wagmi';

import { ProviderType } from '@/constants/ethereum.js';
import { useMaskTheme } from '@/hooks/useMaskTheme.js';

export function MaskProviders({ children }: PropsWithChildren<{}>) {
    const account = useAccount();
    const chainId = useChainId();

    return (
        <DisableShadowRootContext.Provider value>
            <DialogStackingProvider hasGlobalBackdrop={false}>
                <StyledEngineProvider injectFirst>
                    <MaskThemeProvider useMaskIconPalette={(theme) => theme.palette.mode} useTheme={useMaskTheme}>
                        <I18nextProvider i18n={i18NextInstance}>
                            <EVMWeb3ContextProvider
                                account={account.address ?? ''}
                                chainId={chainId}
                                providerType={ProviderType.CustomEvent}
                                controlled
                            >
                                <SharedContextProvider>
                                    <Suspense fallback={null}>
                                        <CSSVariableInjector />
                                        <DisableShadowRootContext.Provider value={false}>
                                            <ShadowRootIsolation>{children}</ShadowRootIsolation>
                                        </DisableShadowRootContext.Provider>
                                    </Suspense>
                                </SharedContextProvider>
                            </EVMWeb3ContextProvider>
                        </I18nextProvider>
                    </MaskThemeProvider>
                </StyledEngineProvider>
            </DialogStackingProvider>
        </DisableShadowRootContext.Provider>
    );
}
