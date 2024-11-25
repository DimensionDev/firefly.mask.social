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
    showParticle?: boolean;
}>;

export const Providers = memo(function RootProviders(props: ProviderProps) {
    setupLocaleForSSR();

    const showParticle = props.showParticle ?? true;
    const children = (
        <SolanaWalletAdapterProvider enableInsights={props.enableInsights}>
            <WagmiProvider enableInsights={props.enableInsights}>{props.children}</WagmiProvider>
        </SolanaWalletAdapterProvider>
    );

    return (
        <LinguiClientProvider>
            <QueryClientProviders>
                <InitialProviders>
                    {showParticle ? <ParticleProvider>{children}</ParticleProvider> : children}
                </InitialProviders>
            </QueryClientProviders>
        </LinguiClientProvider>
    );
});
