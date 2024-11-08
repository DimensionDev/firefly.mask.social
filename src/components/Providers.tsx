import { memo, type PropsWithChildren } from 'react';

import { InitialProviders } from '@/components/InitialProviders.js';
import { LinguiClientProvider } from '@/components/LinguiClientProvider.js';
import { ParticleProvider } from '@/components/ParticleProvider.js';
import { QueryClientProviders } from '@/components/QueryClientProviders.js';
import {
    SolanaWalletAdapterProvider,
} from '@/components/SolanaWalletAdapterProvider.js';
import { WagmiProvider } from '@/components/WagmiProvider.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
import { getLocale, setupLocaleForSSR } from '@/i18n/index.js';

type ProviderProps = PropsWithChildren<{
    enableInsights?: boolean;
}>;

export const Providers = memo(function RootProviders(props: ProviderProps) {
    setupLocaleForSSR();

    const lang = getLocaleFromCookies();
    const message = getLocale(lang);

    return (
        <LinguiClientProvider initialLocale={lang} initialMessages={message}>
            <QueryClientProviders>
                <InitialProviders>
                    <ParticleProvider>
                        <SolanaWalletAdapterProvider enableInsights={props.enableInsights}>
                            <WagmiProvider enableInsights={props.enableInsights}>{props.children}</WagmiProvider>
                        </SolanaWalletAdapterProvider>
                    </ParticleProvider>
                </InitialProviders>
            </QueryClientProviders>
        </LinguiClientProvider>
    );
});
