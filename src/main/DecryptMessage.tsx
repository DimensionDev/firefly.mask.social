import { Trans } from '@lingui/macro';
import { RegistryContext, TypedMessageRender } from '@masknet/typed-message-react';
import React, { lazy, Suspense } from 'react';

import { useDecrypt } from './Decrypt/useDecrypt.js';
import { registry } from './TypedMessageRender/registry.js';

const PluginRender = lazy(() => import('./plugin-render.js'));

export function DecryptMessage(props: { text: string; version: string }) {
    const { text, version } = props;
    const [error, isE2E, message] = useDecrypt(text, version);

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
    if (!message) return <p className="p-2">Decrypting...</p>;

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
                <PluginRender message={message} />
            </Suspense>
        </RegistryContext.Provider>
    );
}
