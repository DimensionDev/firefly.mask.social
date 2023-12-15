'use client';

import { useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script';
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom';

import { MaskProviders } from '@/components/MaskProviders.js';
import { Providers } from '@/components/Providers.js';
import { Modals } from '@/modals/index.js';

const GlobalInjection = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useAnyMode,
    (x) => x.GlobalInjection,
);

export default function PageInspector() {
    return (
        <Providers>
            <MaskProviders>
                <GlobalInjection />
                <Modals />
            </MaskProviders>
        </Providers>
    );
}
