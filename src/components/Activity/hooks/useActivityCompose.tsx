import { useAsyncFn } from 'react-use';

import { useActivityPremiumList } from '@/components/Activity/hooks/useActivityPremiumList.js';
import { SourceInURL } from '@/constants/enum.js';
import { CHAR_TAG, type Chars } from '@/helpers/chars.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import type { Profile } from '@/providers/types/Firefly.js';
import { type Mention, type RequestArguments, SupportedMethod } from '@/types/bridge.js';

export function useActivityCompose() {
    const list = useActivityPremiumList();
    const isPremium = list.some((x) => x.verified);
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
    // cspell: disable-next-line
    const barmstrongMention = {
        tag: CHAR_TAG.MENTION,
        visible: true,
        content: '@brian_armstrong',
        profiles: [
            {
                platform_id: '0x01d86b',
                platform: SourceInURL.Lens,
                handle: 'brian',
                name: 'brian',
                namespace: 'lens',
                hit: false,
                score: 0,
            },
            {
                platform_id: '20',
                platform: SourceInURL.Farcaster,
                // cspell: disable-next-line
                handle: 'barmstrong',
                name: 'Brian Armstrong',
                namespace: '',
                hit: false,
                score: 0,
            },
            {
                platform_id: '14379660',
                platform: SourceInURL.Twitter,
                handle: 'brian_armstrong',
                name: 'brian_armstrong',
                namespace: '',
                hit: true,
                score: 0.062500186,
            },
        ],
    };

    const text = isPremium
        ? [
              'Just claimed the "Huge Congrats🍾 to Brian" collectible from ',
              fireflyMention,
              '!\n\n',
              'If you followed ',
              // cspell: disable-next-line
              barmstrongMention,
              " on X or Farcaster before Oct 20, you're eligible to claim yours at https://firefly.mask.social/event/hlbl .\n\n",
              '#Base #FireflySocial',
          ]
        : [
              'Just claimed the "Huge Congrats🍾 to Brian" collectible from ',
              fireflyMention,
              '!\n\n',
              'If you followed ',
              // cspell: disable-next-line
              barmstrongMention,
              ' on X or Farcaster before Oct 20, you’re eligible to claim yours at https://firefly.mask.social/event/hlbl .\n\n',
              '#Base #FireflySocial',
          ];

    return useAsyncFn(async () => {
        if (fireflyBridgeProvider.supported) {
            const params = text.reduce<RequestArguments[SupportedMethod.COMPOSE]>(
                (acc, part) => {
                    if (typeof part === 'string') {
                        acc.text += part;
                    } else {
                        acc.text += part.content;
                        acc.mentions.push({
                            content: part.content,
                            profiles: part.profiles,
                        } as Mention);
                    }
                    return acc;
                },
                {
                    activity: `${window.location.origin}${window.location.pathname}`,
                    text: '',
                    mentions: [],
                },
            );
            return fireflyBridgeProvider.request(SupportedMethod.COMPOSE, params);
        }

        ComposeModalRef.open({
            type: 'compose',
            chars: text as Chars,
        });
    });
}
