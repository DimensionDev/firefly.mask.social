import { memo } from 'react';

import { InitialProviders } from '@/components/InitialProviders.js';
import { LinguiClientProvider } from '@/components/LinguiClientProvider.js';
import { ParticleProvider } from '@/components/ParticleProvider.js';
import { QueryClientProviders } from '@/components/QueryClientProvider.js';
import { SolanaWalletAdapterProvider } from '@/components/SolanaWalletAdapterProvider.js';
import { WagmiProvider } from '@/components/WagmiProvider.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
import { getLocale, setupLocaleForSSR } from '@/i18n/index.js';

export const Providers = memo(function RootProviders(props: { children: React.ReactNode }) {
    const lang = getLocaleFromCookies();

    const message = getLocale(lang);

    setupLocaleForSSR();

    return (
        <LinguiClientProvider initialLocale={lang} initialMessages={message}>
            <QueryClientProviders>
                <InitialProviders>
                    <ParticleProvider>
                        <SolanaWalletAdapterProvider>
                            <WagmiProvider>{props.children}</WagmiProvider>
                        </SolanaWalletAdapterProvider>
                    </ParticleProvider>
                </InitialProviders>
            </QueryClientProviders>
        </LinguiClientProvider>
    );
});
