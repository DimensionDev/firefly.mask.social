'use client';

import { useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script';
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom';
import { Modals } from '@masknet/shared';
import { noop } from 'lodash-es';
import { memo } from 'react';

import { MaskProviders } from '@/components/MaskProviders.js';
import { Providers } from '@/components/Providers.js';

const GlobalInjection = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useAnyMode,
    (x) => x.GlobalInjection,
);

export default memo(function PageInspector() {
    return (
        <Providers>
            <MaskProviders>
                <GlobalInjection />
                <Modals createWallet={noop} />
            </MaskProviders>
        </Providers>
    );
});
