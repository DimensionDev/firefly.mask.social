'use client';
import { DOMProxy } from '@dimensiondev/holoflows-kit';
import { DecryptProgressKind, EncryptPayloadNetwork } from '@masknet/encryption';
import {
    createInjectHooksRenderer,
    type PostContext,
    PostInfoProvider,
    useActivatedPluginsSiteAdaptor,
} from '@masknet/plugin-infra/content-script';
import { RedPacketInspector } from '@masknet/plugin-redpacket';
import {
    createConstantSubscription,
    EMPTY_ARRAY,
    PostIdentifier,
    ProfileIdentifier,
    ValueRef,
} from '@masknet/shared-base';
import type { TypedMessage } from '@masknet/typed-message';
import { compact } from 'lodash-es';
import { memo, type PropsWithChildren, useEffect, useMemo, useState } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { DecryptMessage } from '@/main/DecryptMessage.js';
import type { Post } from '@/providers/types/SocialMedia.js';

import {
    type DecryptionContext,
    decryptWithDecoding,
} from '../../maskbook/packages/mask/background/services/crypto/index.js';
import { PossiblePluginSuggestionPostInspector } from '../../maskbook/packages/mask/content-script/components/InjectedComponents/DisabledPluginSuggestion.js';

interface Props extends PropsWithChildren<{}> {
    raw: string;
    post: Post;
}

const Decrypted = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode,
    (x) => x.DecryptedInspector,
);

const PluginHooksRenderer = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode,
    (plugin) => plugin.PostInspector,
);

export const DecryptPost = memo(function DecryptPost({ raw, post, children }: Props) {
    const [result, setResult] = useState<TypedMessage | null>(null);

    useEffect(() => {
        const decrypt = async () => {
            const payload = {
                type: 'text',
                text: raw,
            } as const;
            const context: DecryptionContext = {
                encryptPayloadNetwork: EncryptPayloadNetwork.Twitter,
                currentProfile: null,
                authorHint: null,
                postURL: undefined,
            };
            for await (const progress of decryptWithDecoding(payload, context)) {
                if (progress.type === DecryptProgressKind.Success) {
                    return progress.content;
                }
            }
            return null;
        };
        decrypt().then((r) => setResult(r));
    }, [raw]);
    const payload = raw.replace(/.*PostData_v2=/, '');
    const postInfo = useMemo((): PostContext => {
        const author = ProfileIdentifier.of('mask.social', post.author.displayName).unwrapOr(null);
        const url = `${location.origin}/detail/${post.source === SocialPlatform.Farcaster ? 'farcaster' : 'lens'}/${
            post.postId
        }`;
        const imageUris: string[] = compact(
            post.metadata.content?.attachments
                ?.filter((x) => x.type === 'Image')
                .map((x) => x.uri)
                .filter(Boolean) ?? [],
        );
        return {
            author: createConstantSubscription(author),
            coAuthors: EMPTY_ARRAY,
            avatarURL: createConstantSubscription(new URL(post.author.pfp)),
            nickname: createConstantSubscription(post.author.nickname),
            postID: createConstantSubscription(post.postId),
            get rootNode() {
                return null;
            },
            rootElement: DOMProxy(),
            actionsElement: DOMProxy(),
            // TODO
            isFocusing: false,
            suggestedInjectionPoint: document.body,
            comment: undefined,
            identifier: createConstantSubscription(author ? new PostIdentifier(author, post.postId) : null),
            url: createConstantSubscription(new URL(url)),
            mentionedLinks: createConstantSubscription([]),
            postMetadataImages: createConstantSubscription(imageUris),
            rawMessage: createConstantSubscription(result!),
            encryptComment: new ValueRef<null | ((commentToEncrypt: string) => Promise<string>)>(null),
            decryptComment: new ValueRef<null | ((commentToEncrypt: string) => Promise<string | null>)>(null),
            hasMaskPayload: createConstantSubscription(!!result),
            postIVIdentifier: createConstantSubscription(null),
            publicShared: createConstantSubscription(!post.isHidden),
            isAuthorOfPost: createConstantSubscription(!post.hasMirrored),
            version: createConstantSubscription(-40),
            decryptedReport() {
                return;
            },
        };
    }, [post, result]);

    return (
        <PostInfoProvider post={postInfo}>
            {children}
            {result ? <RedPacketInspector message={result} /> : null}
            <div style={{ borderTop: '1px solid blue' }} />
            {result ? <Decrypted message={result} /> : null}
            <div style={{ borderTop: '1px solid blue' }} />
            <DecryptMessage text={payload} version="2" />
            <div style={{ borderTop: '1px solid red' }} />
            <PossiblePluginSuggestionPostInspector />
            <PluginHooksRenderer />
        </PostInfoProvider>
    );
});
