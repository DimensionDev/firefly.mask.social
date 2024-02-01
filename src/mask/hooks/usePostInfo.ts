import { DOMProxy } from '@dimensiondev/holoflows-kit';
import { type PostContext } from '@masknet/plugin-infra/content-script';
import {
    createConstantSubscription,
    EMPTY_ARRAY,
    EMPTY_LIST,
    EnhanceableSite,
    PostIdentifier,
    ProfileIdentifier,
    ValueRef,
} from '@masknet/shared-base';
import { makeTypedMessageEmpty, makeTypedMessageTuple } from '@masknet/typed-message';
import { compact } from 'lodash-es';
import { useMemo } from 'react';
import urlcat from 'urlcat';

import { SITE_HOSTNAME, SITE_URL } from '@/constants/index.js';
import { URL_REGEX } from '@/constants/regex.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function usePostInfo(post: Post) {
    return useMemo((): PostContext => {
        const author = ProfileIdentifier.of(SITE_HOSTNAME, post.author.profileId).unwrapOr(null);
        const imageUris: string[] = compact(
            post.metadata.content?.attachments
                ?.filter((x) => x.type === 'Image')
                .map((x) => x.uri)
                .filter(Boolean) ?? EMPTY_LIST,
        );

        const mentionedLinks = post.metadata.content?.content?.match(URL_REGEX) || EMPTY_LIST;

        return {
            author: createConstantSubscription(author),
            source: post.source,
            coAuthors: EMPTY_ARRAY,
            avatarURL: createConstantSubscription(new URL(post.author.pfp)),
            nickname: createConstantSubscription(post.author.displayName),
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
            url: createConstantSubscription(new URL(urlcat(SITE_URL, getPostUrl(post)))),
            mentionedLinks: createConstantSubscription(mentionedLinks),
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
}
