'use client';
import { Trans } from '@lingui/macro';
import { PostInfoProvider, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script';
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom';
import { RegistryContext, TypedMessageRender } from '@masknet/typed-message-react';
import { first } from 'lodash-es';
import { memo, type PropsWithChildren } from 'react';
import React, { Suspense } from 'react';
import { useAsyncRetry } from 'react-use';

import { ClickableArea } from '@/components/ClickableArea.js';
import type { EncryptedPayload } from '@/helpers/getEncryptedPayload.js';
import { MaskPostExtraPluginWrapper } from '@/mask/bindings/components.js';
import { usePostInfo } from '@/mask/hooks/usePostInfo.js';
import { registry } from '@/mask/typed-message/registry.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { decryptPayload } from '@/services/decryptPayload.js';

const Decrypted = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useAnyMode,
    (x) => x.DecryptedInspector,
    MaskPostExtraPluginWrapper,
);

interface Props extends PropsWithChildren<{}> {
    post: Post;
    payloads?: EncryptedPayload[];
}

export const DecryptedPost = memo(function DecryptedPost({ post, payloads, children }: Props) {
    // TODO: support multiple payloads
    const payload = first(payloads);

    const postInfo = usePostInfo(post);

    const { value: [error, isE2E, message] = [null, false, null] } = useAsyncRetry(async () => {
        if (!payload) return;
        return decryptPayload(payload);
    }, [payload]);

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
            <ClickableArea>
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
            </ClickableArea>
        </PostInfoProvider>
    );
});
