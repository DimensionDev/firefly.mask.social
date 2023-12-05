import '../plugin-host/enable.js';

import { useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script';
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom';
import { MaskPostExtraPluginWrapper } from '@masknet/shared';
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme';
import type { TypedMessage } from '@masknet/typed-message';

const Decrypted = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useAnyMode,
    (x) => x.DecryptedInspector,
    MaskPostExtraPluginWrapper,
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
