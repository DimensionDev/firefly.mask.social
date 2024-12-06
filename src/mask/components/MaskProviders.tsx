'use client';

import { LanguageOptions } from '@masknet/public-api';
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base';
import { ProviderType } from '@masknet/web3-shared-evm';
import { StyledEngineProvider } from '@mui/material';
import { memo, type PropsWithChildren, Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useMount } from 'react-use';

import { Locale } from '@/constants/enum.js';
import { getLocaleFromCookies } from '@/helpers/getFromCookies.js';
import { useMaskTheme } from '@/hooks/useMaskTheme.js';
import {
    CSSVariableInjector,
    DialogStackingProvider,
    DisableShadowRootContext,
    MaskThemeProvider,
    ShadowRootIsolation,
    SharedContextProvider,
} from '@/mask/bindings/components.js';
import { i18NextInstance, updateLanguage } from '@/mask/bindings/index.js';
import { useChainContext } from '@/hooks/useChainContext.js';

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

export const MaskProviders = memo(function MaskProviders({ children }: PropsWithChildren<{}>) {
    const { account, chainId } = useChainContext();

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
                                account={account}
                                chainId={chainId}
                                providerType={ProviderType.CustomEvent}
                                controlled
                            >
                                <SharedContextProvider>
                                    <Suspense fallback={null}>
                                        <CSSVariableInjector />
                                        <ShadowRootIsolation>{children}</ShadowRootIsolation>
                                    </Suspense>
                                </SharedContextProvider>
                            </EVMWeb3ContextProvider>
                        </I18nextProvider>
                    </MaskThemeProvider>
                </StyledEngineProvider>
            </DialogStackingProvider>
        </DisableShadowRootContext.Provider>
    );
});
