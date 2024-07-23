'use client';

import { LanguageOptions } from '@masknet/public-api';
import { SharedContextProvider } from '@masknet/shared';
import { i18NextInstance, updateLanguage } from '@masknet/shared-base';
import {
    CSSVariableInjector,
    DialogStackingProvider,
    DisableShadowRootContext,
    MaskThemeProvider,
    ShadowRootIsolation,
} from '@masknet/theme';
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base';
import { ProviderType } from '@masknet/web3-shared-evm';
import { StyledEngineProvider } from '@mui/material';
import { type PropsWithChildren, Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useMount } from 'react-use';
import { useAccount, useChainId } from 'wagmi';

import { Locale } from '@/constants/enum.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
import { useMaskTheme } from '@/hooks/useMaskTheme.js';

function resolveMaskLocale(locale: Locale) {
    switch (locale) {
        case Locale.en:
            return LanguageOptions.enUS;
        case Locale.zhHans:
            return LanguageOptions.zhCN;
        case Locale.zhHant:
            return LanguageOptions.zhTW;
        default:
            return LanguageOptions.__auto__;
    }
}

export function MaskProviders({ children }: PropsWithChildren<{}>) {
    const account = useAccount();
    const chainId = useChainId();

    useMount(() => {
        updateLanguage(resolveMaskLocale(getLocaleFromCookies()));
    });

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
