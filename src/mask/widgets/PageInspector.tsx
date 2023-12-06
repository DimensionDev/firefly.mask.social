'use client';

import { useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script';
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom';
import { Modals } from '@masknet/shared';
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme';
import { noop } from 'lodash-es';

import { Providers } from '@/components/Provider.js';
import { Providers as MaskProviders } from '@/mask/widgets/Providers.js';

const GlobalInjection = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useAnyMode,
    (x) => x.GlobalInjection,
);

export default function PageInspector() {
    return (
        <DisableShadowRootContext.Provider value={false}>
            <ShadowRootIsolation>
                <Providers>
                    <MaskProviders>
                        <GlobalInjection />
                        <Modals createWallet={noop} />
                    </MaskProviders>
                </Providers>
            </ShadowRootIsolation>
        </DisableShadowRootContext.Provider>
    );
}
