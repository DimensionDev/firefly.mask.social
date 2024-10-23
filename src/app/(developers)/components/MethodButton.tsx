'use client';

import { safeUnreachable } from '@masknet/kit';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';

import { ClickableButton } from '@/components/ClickableButton.js';
import { SourceInURL } from '@/constants/enum.js';
import { SITE_NAME, SITE_URL } from '@/constants/index.js';
import { enqueueErrorMessage, enqueueInfoMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { type MethodItem, Network, Platform, SupportedMethod } from '@/types/bridge.js';

interface Props {
    item: MethodItem;
}

export function MethodButton({ item }: Props) {
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
                    enqueueInfoMessage(`Success: ${result.success}`);
                    break;
                }
                case SupportedMethod.SHARE:
                    fireflyBridgeProvider.request(SupportedMethod.SHARE, { text: SITE_NAME });
                    break;
                case SupportedMethod.COMPOSE:
                    fireflyBridgeProvider.request(SupportedMethod.COMPOSE, {
                        text: SITE_NAME,
                        activity: urlcat(SITE_URL, '/event/hlbl'),
                        mentions: [
                            {
                                content: '@Firefly',
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
                        ],
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
            enqueueErrorMessage(getSnackbarMessageFromError(error, 'Failed to call method'), {
                error,
            });
            throw error;
        }
    });
    return (
        <ClickableButton
            className="rounded-md bg-main px-2 py-1 text-primaryBottom"
            disabled={loading}
            onClick={onClick}
        >
            {item.name}()
        </ClickableButton>
    );
}
