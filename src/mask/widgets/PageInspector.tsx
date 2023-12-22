'use client';

import { noop } from 'lodash-es';
import { Modals } from '@masknet/shared';
import { useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script';
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom';

import { MaskProviders } from '@/components/MaskProviders.js';
import { Providers } from '@/components/Providers.js';

const GlobalInjection = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useAnyMode,
    (x) => x.GlobalInjection,
);

export default function PageInspector() {
    return (
        <Providers>
            <MaskProviders>
                <GlobalInjection />
                <Modals createWallet={noop} />
            </MaskProviders>
        </Providers>
    );
}
