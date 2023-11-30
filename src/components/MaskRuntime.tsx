'use client';
import '../plugin-host/enable.js';

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
import { Suspense, use } from 'react';
import { type PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useAccount } from 'wagmi';

import { useMaskTheme } from '@/hooks/useMaskTheme.js';

import { doInitWallet } from '../maskbook/packages/app/src/setup/wallet.js';

const promise = doInitWallet();

export function Runtime({ children }: PropsWithChildren<{}>) {
    use(promise);

    const account = useAccount();
    return (
        <DisableShadowRootContext.Provider value>
            <DialogStackingProvider hasGlobalBackdrop={false}>
                <StyledEngineProvider injectFirst>
                    <MaskThemeProvider useMaskIconPalette={(theme) => theme.palette.mode} useTheme={useMaskTheme}>
                        <I18nextProvider i18n={i18NextInstance}>
                            <RootWeb3ContextProvider>
                                <ChainContextProvider account={account.address} chainId={ChainId.Mainnet}>
                                    <SharedContextProvider>
                                        <CSSVariableInjector />
                                        {children}
                                    </SharedContextProvider>
                                </ChainContextProvider>
                            </RootWeb3ContextProvider>
                        </I18nextProvider>
                    </MaskThemeProvider>
                </StyledEngineProvider>
            </DialogStackingProvider>
        </DisableShadowRootContext.Provider>
    );
}

export default function MaskRuntime({ children }: PropsWithChildren<{}>) {
    return (
        <Suspense fallback={null}>
            <Runtime>{children}</Runtime>
        </Suspense>
    );
}
