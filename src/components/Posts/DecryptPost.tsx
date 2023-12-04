'use client';
import { DOMProxy } from '@dimensiondev/holoflows-kit';
import { type PostContext, PostInfoProvider } from '@masknet/plugin-infra/content-script';
import {
    createConstantSubscription,
    EMPTY_ARRAY,
    EnhanceableSite,
    PostIdentifier,
    ProfileIdentifier,
    ValueRef,
} from '@masknet/shared-base';
import { makeTypedMessageEmpty, makeTypedMessageTuple } from '@masknet/typed-message';
import { compact } from 'lodash-es';
import { memo, type PropsWithChildren, useMemo } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { DecryptMessage } from '@/main/DecryptMessage.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface Props extends PropsWithChildren<{}> {
    post: Post;
    payload: [string, '1' | '2'];
}

export const DecryptPost = memo(function DecryptPost({ post, payload, children }: Props) {
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
            site: EnhanceableSite.Firefly,
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
            rawMessage: createConstantSubscription(makeTypedMessageTuple([makeTypedMessageEmpty()])),
            encryptComment: new ValueRef<null | ((commentToEncrypt: string) => Promise<string>)>(null),
            decryptComment: new ValueRef<null | ((commentToEncrypt: string) => Promise<string | null>)>(null),
            hasMaskPayload: createConstantSubscription(true),
            postIVIdentifier: createConstantSubscription(null),
            publicShared: createConstantSubscription(!post.isHidden),
            isAuthorOfPost: createConstantSubscription(!post.hasMirrored),
            version: createConstantSubscription(-40),
            decryptedReport() {
                return;
            },
        };
    }, [post]);

    return (
        <PostInfoProvider post={postInfo}>
            {children}
            <div
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                <DecryptMessage text={payload[0]} version={payload[1]} />
            </div>
        </PostInfoProvider>
    );
});
