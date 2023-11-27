'use client';
import '../plugin-host/enable.js';

import { useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script';
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom';
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme';
import type { TypedMessage } from '@masknet/typed-message';

const Decrypted = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useAnyMode,
    (x) => x.DecryptedInspector,
);

export default function PluginRender(props: { message: TypedMessage }) {
    return (
        <DisableShadowRootContext.Provider value={false}>
            <ShadowRootIsolation>
                <Decrypted message={props.message} />
            </ShadowRootIsolation>
        </DisableShadowRootContext.Provider>
    );
}
