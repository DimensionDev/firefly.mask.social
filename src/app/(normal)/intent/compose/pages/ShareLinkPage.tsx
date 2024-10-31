'use client';

import { compact } from 'lodash-es';
import { useEffect, useRef } from 'react';

import { DiscoverPage } from '@/app/(normal)/pages/Discover.js';
import { Source } from '@/constants/enum.js';
import { EMPTY_LIST, FIREFLY_MENTION, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { CHAR_TAG } from '@/helpers/chars.js';
import { resolveSocialSourceInUrl } from '@/helpers/resolveSourceInUrl.js';
import { trimify } from '@/helpers/trimify.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';

export interface ShareLinkProps {
    text: string;
    url: string;
    via: string;
}

async function searchProfiles(query: string) {
    const data = await FireflyEndpointProvider.searchIdentity(query);
    if (!data?.list?.length) return [];

    const profiles = compact(
        SORTED_SOCIAL_SOURCES.map((source) => {
            const key = resolveSocialSourceInUrl(source);
            const matched = data.list.find((x) => {
                return (x[key] ?? EMPTY_LIST).some((y) => y.hit);
            });

            return matched ? matched[key]?.find((profile) => profile.hit) : null;
        }),
    );

    return profiles;
}

async function openCompose(props: ShareLinkProps) {
    const query = trimify(props.via).replace(/^@/, '');
    const profiles = query ? await searchProfiles(query) : [];

    ComposeModalRef.open({
        type: 'compose',
        chars: [
            `${props.text}\n`,
            `${props.url || 'https://firefly.social/'} via `,
            query
                ? {
                      tag: CHAR_TAG.MENTION,
                      visible: true,
                      content: `@${query}`,
                      profiles,
                  }
                : {
                      ...FIREFLY_MENTION,
                      tag: CHAR_TAG.MENTION,
                  },
        ],
    });
}

export function ShareLinkPage(props: ShareLinkProps) {
    const isLogin = useIsLogin();
    const hasOpened = useRef(false);

    useEffect(() => {
        if (!isLogin) {
            LoginModalRef.open();
            return;
        }
        if (hasOpened.current) return;
        openCompose(props);
        hasOpened.current = true;
    }, [isLogin, props]);

    return <DiscoverPage source={Source.Farcaster} />;
}
