'use client';

import { useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script';
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom';
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme';
import type { TypedMessage } from '@masknet/typed-message';

import { MaskPostExtraPluginWrapperWithPermission } from '@/maskbook/packages/mask/content-script/components/InjectedComponents/PermissionBoundary.js';

const Decrypted = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useAnyMode,
    (x) => x.DecryptedInspector,
    MaskPostExtraPluginWrapperWithPermission,
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
