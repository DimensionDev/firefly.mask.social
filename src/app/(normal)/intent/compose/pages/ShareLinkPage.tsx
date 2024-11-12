'use client';

import { useRouter } from 'next/navigation.js';
import { useEffect } from 'react';

import { DiscoverPage } from '@/app/(normal)/pages/Discover.js';
import { Source, SourceInURL } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { CHAR_TAG } from '@/helpers/chars.js';
import { formatSearchIdentities } from '@/helpers/formatSearchIdentities.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfile.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { trimify } from '@/helpers/trimify.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { Profile } from '@/providers/types/Firefly.js';

export interface ShareLinkProps {
    text: string;
    url: string;
    via: string;
}

const fireflyMention = {
    tag: CHAR_TAG.MENTION,
    visible: true,
    content: `@thefireflyapp`,
    profiles: [
        {
            platform_id: '1583361564479889408',
            platform: SourceInURL.Twitter,
            handle: 'thefireflyapp',
            name: 'thefireflyapp',
            hit: true,
            score: 0,
        },
        {
            platform_id: '16823',
            platform: SourceInURL.Farcaster,
            handle: 'fireflyapp',
            name: 'Firefly App',
            hit: true,
            score: 0,
        },
        {
            platform_id: '0x01b000',
            platform: SourceInURL.Lens,
            handle: 'fireflyapp',
            name: 'fireflyapp',
            hit: true,
            score: 0,
        },
    ] as Profile[],
};

async function searchIdentities(query: string) {
    const data = await FireflyEndpointProvider.searchIdentity(query);
    if (!data.data.length) return [];

    return formatSearchIdentities(data.data);
}

async function openCompose(props: ShareLinkProps, onFinished: () => void) {
    const query = trimify(props.via || '').replace(/^@/, '');
    const identities = query ? await searchIdentities(query) : [];

    const currentProfiles = getCurrentProfileAll();
    const matchedIdentity = identities.find((x) => x.profile.handle === query);

    const isLogin = Object.values(currentProfiles).some((x) => !!x?.profileId);
    if (!isLogin) {
        LoginModalRef.open(
            matchedIdentity ? { source: resolveSocialSource(matchedIdentity.profile.platform) } : undefined,
        );
        return;
    }

    const expectedSources = matchedIdentity?.related
        .map((x) => resolveSocialSource(x.platform))
        .filter((x) => !!currentProfiles[x]?.profileId);

    await ComposeModalRef.openAndWaitForClose({
        type: 'compose',
        source: expectedSources,
        chars: [
            `${props.text}\n`,
            `${props.url || 'https://firefly.social/'} via `,
            query
                ? {
                      tag: CHAR_TAG.MENTION,
                      visible: true,
                      content: `@${query}`,
                      profiles: matchedIdentity?.related || EMPTY_LIST,
                  }
                : {
                      ...fireflyMention,
                      tag: CHAR_TAG.MENTION,
                  },
        ],
    });

    onFinished();
}

export function ShareLinkPage(props: ShareLinkProps) {
    const isLogin = useIsLogin();
    const router = useRouter();

    useEffect(() => {
        openCompose(props, () => router.replace('/'));
    }, [isLogin, props, router]);

    return <DiscoverPage source={Source.Farcaster} />;
}
