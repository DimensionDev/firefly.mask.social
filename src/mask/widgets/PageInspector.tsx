'use client';

import { useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script';
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom';
import { Modals } from '@masknet/shared';
import { noop } from 'lodash-es';

import { ClientProviders } from '@/components/ClientProviders.js';
import { MaskProviders } from '@/components/MaskProviders.js';

const GlobalInjection = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useAnyMode,
    (x) => x.GlobalInjection,
);

export default function PageInspector() {
    return (
        <ClientProviders>
            <MaskProviders>
                <GlobalInjection />
                <Modals createWallet={noop} />
            </MaskProviders>
        </ClientProviders>
    );
}
