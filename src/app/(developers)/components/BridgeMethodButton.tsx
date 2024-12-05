/* cspell:disable */

'use client';

import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useAsyncFn } from 'react-use';

import { ClickableButton } from '@/components/ClickableButton.js';
import { SITE_DESCRIPTION, SITE_NAME } from '@/constants/index.js';
import { enqueueInfoMessage, enqueueMessageFromError } from '@/helpers/enqueueMessage.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { type Mention, type MethodItem, Network, Platform, SupportedMethod } from '@/types/bridge.js';

interface Props {
    item: MethodItem;
}

export function BridgeMethodButton({ item }: Props) {
    const [{ loading }, onClick] = useAsyncFn(async () => {
        try {
            switch (item.name) {
                case SupportedMethod.GET_SUPPORTED_METHODS: {
                    const methods = await fireflyBridgeProvider.request(SupportedMethod.GET_SUPPORTED_METHODS, {});
                    enqueueInfoMessage(JSON.stringify(methods, null, 2));
                    break;
                }
                case SupportedMethod.GET_WALLET_ADDRESS: {
                    const items = await fireflyBridgeProvider.request(SupportedMethod.GET_WALLET_ADDRESS, {
                        type: Network.All,
                    });
                    enqueueInfoMessage(JSON.stringify(items, null, 2));
                    break;
                }
                case SupportedMethod.GET_AUTHORIZATION: {
                    const token = await fireflyBridgeProvider.request(SupportedMethod.GET_AUTHORIZATION, {});
                    enqueueInfoMessage(`Authorization: ${token}`);
                    break;
                }
                case SupportedMethod.GET_THEME: {
                    const theme = await fireflyBridgeProvider.request(SupportedMethod.GET_THEME, {});
                    enqueueInfoMessage(`Theme: ${theme}`);
                    break;
                }
                case SupportedMethod.GET_LANGUAGE: {
                    const language = await fireflyBridgeProvider.request(SupportedMethod.GET_LANGUAGE, {});
                    enqueueInfoMessage(`Language: ${language}`);
                    break;
                }
                case SupportedMethod.CONNECT_WALLET: {
                    const walletAddress = await fireflyBridgeProvider.request(SupportedMethod.CONNECT_WALLET, {
                        type: Network.All,
                    });
                    enqueueInfoMessage(`Wallet Address: ${walletAddress}`);
                    break;
                }
                case SupportedMethod.BIND_WALLET: {
                    const walletAddress = await fireflyBridgeProvider.request(SupportedMethod.BIND_WALLET, {
                        type: Network.EVM,
                    });
                    enqueueInfoMessage(`Wallet Address: ${walletAddress}`);
                    break;
                }
                case SupportedMethod.IS_TWITTER_USER_FOLLOWING: {
                    const following = await fireflyBridgeProvider.request(SupportedMethod.IS_TWITTER_USER_FOLLOWING, {
                        id: '952921795316912133',
                    });
                    enqueueInfoMessage(`Following: ${following}`);
                    break;
                }
                case SupportedMethod.FOLLOW_TWITTER_USER: {
                    const followed = await fireflyBridgeProvider.request(SupportedMethod.FOLLOW_TWITTER_USER, {
                        id: '952921795316912133',
                    });
                    enqueueInfoMessage(`Followed: ${followed}`);
                    break;
                }
                case SupportedMethod.UPDATE_NAVIGATOR_BAR: {
                    await fireflyBridgeProvider.request(SupportedMethod.UPDATE_NAVIGATOR_BAR, {
                        show: true,
                        title: `${SITE_NAME} ${Math.random()}`,
                    });
                    break;
                }
                case SupportedMethod.OPEN_URL: {
                    fireflyBridgeProvider.request(SupportedMethod.OPEN_URL, { url: 'https://firefly.land' });
                    break;
                }
                case SupportedMethod.LOGIN: {
                    const result = await fireflyBridgeProvider.request(SupportedMethod.LOGIN, {
                        platform: Platform.FARCASTER,
                    });
                    enqueueInfoMessage(`Success: ${result}`);
                    break;
                }
                case SupportedMethod.SHARE:
                    fireflyBridgeProvider.request(SupportedMethod.SHARE, { text: SITE_NAME });
                    break;
                case SupportedMethod.COMPOSE:
                    fireflyBridgeProvider.request(SupportedMethod.COMPOSE, {
                        text: `${SITE_DESCRIPTION} @thefireflyapp`,
                        activity: 'firefly',
                        mentions: [
                            {
                                content: '@thefireflyapp',
                                profiles: [
                                    {
                                        platform_id: '0x01d86b',
                                        platform: Platform.LENS,
                                        handle: 'brian',
                                        name: 'brian',
                                        namespace: 'lens',
                                        hit: false,
                                        score: 0,
                                    },
                                    {
                                        platform_id: '20',
                                        platform: Platform.FARCASTER,
                                        handle: 'barmstrong',
                                        name: 'Brian Armstrong',
                                        namespace: '',
                                        hit: false,
                                        score: 0,
                                    },
                                    {
                                        platform_id: '14379660',
                                        platform: Platform.TWITTER,
                                        handle: 'brian_armstrong',
                                        name: 'brian_armstrong',
                                        namespace: '',
                                        hit: true,
                                        score: 0.062500186,
                                    },
                                ],
                            },
                        ] as Mention[],
                    });
                    break;
                case SupportedMethod.BACK:
                    fireflyBridgeProvider.request(SupportedMethod.BACK, {});
                    break;
                default:
                    safeUnreachable(item.name);
                    break;
            }
        } catch (error) {
            enqueueMessageFromError(error, t`Failed to execute method`);
            throw error;
        }
    });
    return (
        <ClickableButton
            className="rounded-md bg-main px-2 py-1 text-primaryBottom"
            disabled={loading}
            onClick={onClick}
        >
            <Trans>Invoke</Trans>
        </ClickableButton>
    );
}
