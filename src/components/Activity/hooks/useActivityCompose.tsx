import { useAsyncFn } from 'react-use';

import { SourceInURL } from '@/constants/enum.js';
import { CHAR_TAG } from '@/helpers/chars.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { SupportedMethod } from '@/types/bridge.js';

export function useActivityCompose() {
    return useAsyncFn(async () => {
        const text = `Just claimed the "Welcome back 🎉 to CZ" collectible from @thefireflyapp !\n\nIf you followed https://x.com/cz_binance on X before Sept 21, you're eligible to claim yours at https://cz.firefly.social .\n\n`;
        if (fireflyBridgeProvider.supported) {
            return fireflyBridgeProvider.request(SupportedMethod.COMPOSE, {
                text,
            });
        }

        ComposeModalRef.open({
            type: 'compose',
            chars: [
                `Just claimed the "Welcome back 🎉 to CZ" collectible from `,
                {
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
                    ],
                },
                `!\n\nIf you followed `,
                {
                    tag: CHAR_TAG.MENTION,
                    visible: true,
                    content: '@cz_binance',
                    profiles: [
                        {
                            platform_id: '902926941413453824',
                            platform: SourceInURL.Twitter,
                            handle: 'cz_binance',
                            name: 'cz_binance',
                            hit: true,
                            score: 0,
                        },
                    ],
                },
                ` on X before Sept 21, you're eligible to claim yours at https://cz.firefly.social . \n\n`,
                '#CZ #FireflySocial',
            ],
        });
    });
}
