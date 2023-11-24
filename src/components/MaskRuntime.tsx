'use client';
import '../maskbook/packages/app/src/setup/storage.js';
import '../maskbook/packages/app/src/setup/wallet.js';

import { languages, PLUGIN_ID } from '@masknet/plugin-calendar';
import { languages as redPacketLanguages, PLUGIN_ID as REDPACKET_PLUGIN_ID } from '@masknet/plugin-redpacket';
import { languages as sharedLanguages, SharedContextProvider } from '@masknet/shared';
import { addI18NBundle, i18NextInstance } from '@masknet/shared-base';
import {
    CSSVariableInjector,
    DialogStackingProvider,
    DisableShadowRootContext,
    MaskLightTheme,
    MaskThemeProvider,
} from '@masknet/theme';
import { ChainContextProvider, RootWeb3ContextProvider } from '@masknet/web3-hooks-base';
import { ChainId } from '@masknet/web3-shared-evm';
import { StyledEngineProvider } from '@mui/material';
import { type PropsWithChildren, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useAccount } from 'wagmi';

function useTheme() {
    return MaskLightTheme;
}

export default function MaskRuntime({ children }: PropsWithChildren<{}>) {
    useEffect(() => {
        addI18NBundle(i18NextInstance, 'shared', sharedLanguages);
        addI18NBundle(i18NextInstance, PLUGIN_ID, languages);
        addI18NBundle(i18NextInstance, REDPACKET_PLUGIN_ID, redPacketLanguages);
    }, []);

    const account = useAccount();
    return (
        <DisableShadowRootContext.Provider value>
            <DialogStackingProvider hasGlobalBackdrop={false}>
                <StyledEngineProvider injectFirst>
                    <MaskThemeProvider useMaskIconPalette={(theme) => theme.palette.mode} useTheme={useTheme}>
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
