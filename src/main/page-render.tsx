import '../plugin-host/enable.js';

import { useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script';
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom';
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme';

const GlobalInjection = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useAnyMode,
    (x) => x.GlobalInjection,
);

export default function PageInspectorRender() {
    return (
        <DisableShadowRootContext.Provider value={false}>
            <ShadowRootIsolation>
                <GlobalInjection />
            </ShadowRootIsolation>
        </DisableShadowRootContext.Provider>
    );
}
