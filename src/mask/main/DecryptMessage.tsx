'use client';

import { Trans } from '@lingui/macro';
import { useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script';
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom';
import { MaskPostExtraPluginWrapper } from '@masknet/shared';
import { RegistryContext, TypedMessageRender } from '@masknet/typed-message-react';
import React, { Suspense, useEffect } from 'react';

import { connectMaskWithWagmi } from '@/helpers/connectWagmiWithMask.js';
import { useDecrypt } from '@/mask/main/Decrypt/useDecrypt.js';
import { registry } from '@/mask/main/TypedMessageRender/registry.js';
import { hasRedPacketPayload } from '@/modals/hasRedPacketPayload.js';

const Decrypted = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useAnyMode,
    (x) => x.DecryptedInspector,
    MaskPostExtraPluginWrapper,
);

export function DecryptMessage(props: { text: string; version: string }) {
    const { text, version } = props;
    const [error, isE2E, message] = useDecrypt(text, version);

    useEffect(() => {
        // TODO: remove this condition when we have a lot of plugins that use web3 connection
        if (hasRedPacketPayload(message)) connectMaskWithWagmi();
    }, [message]);

    if (isE2E)
        return (
            <p className="p-2">
                <Trans>
                    This message is a e2e encrypted message. You can only decrypt this message when it is encrypted to
                    you and decrypt it with Mask Network extension.
                </Trans>
            </p>
        );

    if (error)
        return (
            <p className="p-2">
                <Trans>We encountered an error when try to decrypt this message: {error.message}</Trans>
            </p>
        );

    if (!message) return null;

    return (
        <RegistryContext.Provider value={registry.getTypedMessageRender}>
            <div className="p-2">
                <TypedMessageRender message={message} />
            </div>

            <Suspense
                fallback={
                    <p className="p-2">
                        <Trans>Plugin is loading...</Trans>
                    </p>
                }
            >
                <Decrypted message={message} />
            </Suspense>
        </RegistryContext.Provider>
    );
}
