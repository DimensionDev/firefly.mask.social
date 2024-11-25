import { memo, type PropsWithChildren } from 'react';

import { InitialProviders } from '@/components/InitialProviders.js';
import { LinguiClientProvider } from '@/components/LinguiClientProvider.js';
import { ParticleProvider } from '@/components/ParticleProvider.js';
import { QueryClientProviders } from '@/components/QueryClientProviders.js';
import { SolanaWalletAdapterProvider } from '@/components/SolanaWalletAdapterProvider.js';
import { WagmiProvider } from '@/components/WagmiProvider.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

type ProviderProps = PropsWithChildren<{
    enableInsights?: boolean;
    enableParticle?: boolean;
}>;

export const Providers = memo(function RootProviders({
    enableInsights = false,
    enableParticle = true,
    ...props
}: ProviderProps) {
    setupLocaleForSSR();

    const children = (
        <SolanaWalletAdapterProvider enableInsights={enableInsights}>
            <WagmiProvider enableInsights={enableInsights}>{props.children}</WagmiProvider>
        </SolanaWalletAdapterProvider>
    );

    return (
        <LinguiClientProvider>
            <QueryClientProviders>
                <InitialProviders>
                    {enableParticle ? <ParticleProvider>{children}</ParticleProvider> : children}
                </InitialProviders>
            </QueryClientProviders>
        </LinguiClientProvider>
    );
});
