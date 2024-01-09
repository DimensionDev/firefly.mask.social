'use client';
import { Trans } from '@lingui/macro';
import { PostInfoProvider, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script';
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom';
import { MaskPostExtraPluginWrapper } from '@masknet/shared';
import { RegistryContext, TypedMessageRender } from '@masknet/typed-message-react';
import { memo, type PropsWithChildren } from 'react';
import React, { Suspense, useEffect } from 'react';
import { useAsyncRetry } from 'react-use';

import { connectMaskWithWagmi } from '@/helpers/connectWagmiWithMask.js';
import type { EncryptedPayload } from '@/helpers/getEncryptedPayload.js';
import { usePostInfo } from '@/mask/hooks/usePostInfo.js';
import { registry } from '@/mask/main/registry.js';
import { hasRedPacketPayload } from '@/modals/hasRedPacketPayload.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { decryptPayload } from '@/services/decryptPayload.js';

const Decrypted = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useAnyMode,
    (x) => x.DecryptedInspector,
    MaskPostExtraPluginWrapper,
);

interface Props extends PropsWithChildren<{}> {
    post: Post;
    payload: EncryptedPayload;
}

export const DecryptedPost = memo(function DecryptedPost({ post, payload, children }: Props) {
    const postInfo = usePostInfo(post);

    const { value: [error, isE2E, message] = [null, false, null] } = useAsyncRetry(
        async () => decryptPayload(payload),
        [payload],
    );

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
        <PostInfoProvider post={postInfo}>
            {children}
            <div
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
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
            </div>
        </PostInfoProvider>
    );
});
