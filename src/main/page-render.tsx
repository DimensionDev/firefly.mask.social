'use client';
// import '../plugin-host/enable.js';

import { useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script';
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom';
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme';
import dynamic from 'next/dynamic.js';

const GlobalInjection = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useAnyMode,
    (x) => x.GlobalInjection,
);

// @ts-ignore
const MaskRuntime = dynamic(() => import('@/MaskRuntime/index.js'), {
    ssr: false,
});

export default function PageInspectorRender() {
    return (
        <MaskRuntime>
            <DisableShadowRootContext.Provider value={false}>
                <ShadowRootIsolation>
                    <GlobalInjection />
                </ShadowRootIsolation>
            </DisableShadowRootContext.Provider>
        </MaskRuntime>
    );
}
