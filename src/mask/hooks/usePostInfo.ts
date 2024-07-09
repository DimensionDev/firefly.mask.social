import { DOMProxy } from '@dimensiondev/holoflows-kit';
import { type PostContext } from '@masknet/plugin-infra/content-script';
import {
    createConstantSubscription,
    EnhanceableSite,
    PostIdentifier,
    ProfileIdentifier,
    ValueRef,
} from '@masknet/shared-base';
import { makeTypedMessageEmpty, makeTypedMessageTuple } from '@masknet/typed-message';
import { compact } from 'lodash-es';
import { useMemo } from 'react';
import urlcat from 'urlcat';

import { EMPTY_LIST, SITE_HOSTNAME, SITE_URL } from '@/constants/index.js';
import { URL_REGEX } from '@/constants/regexp.js';
import { EMPTY_ARRAY } from '@/constants/subscription.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { parseURL } from '@/helpers/parseURL.js';
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
        const url = parseURL(urlcat(SITE_URL, getPostUrl(post)));
        const avatarURL = parseURL(post.author.pfp);

        return {
            author: createConstantSubscription(author),
            handle: createConstantSubscription(post.author.fullHandle),
            source: post.source,
            coAuthors: EMPTY_ARRAY,
            url: createConstantSubscription(url),
            avatarURL: createConstantSubscription(avatarURL),
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
