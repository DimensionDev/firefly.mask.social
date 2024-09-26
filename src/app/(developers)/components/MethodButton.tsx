'use client';

import { safeUnreachable } from '@masknet/kit';
import { useAsyncFn } from 'react-use';

import { ClickableButton } from '@/components/ClickableButton.js';
import { SITE_NAME } from '@/constants/index.js';
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
                case SupportedMethod.GET_WALLET_ADDRESS: {
                    const items = await fireflyBridgeProvider.request(SupportedMethod.GET_WALLET_ADDRESS, {
                        type: Network.All,
                    });
                    enqueueInfoMessage(items);
                    break;
                }
                case SupportedMethod.GET_SUPPORTED_METHODS: {
                    const methods = await fireflyBridgeProvider.request(SupportedMethod.GET_SUPPORTED_METHODS, {});
                    enqueueInfoMessage(methods);
                    break;
                }
                case SupportedMethod.CONNECT_WALLET: {
                    const { walletAddress } = await fireflyBridgeProvider.request(SupportedMethod.CONNECT_WALLET, {
                        type: Network.All,
                    });
                    enqueueInfoMessage(walletAddress);
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
                    fireflyBridgeProvider.request(SupportedMethod.SHARE, { text: SITE_NAME }, true);
                    break;
                case SupportedMethod.COMPOSE:
                    fireflyBridgeProvider.request(
                        SupportedMethod.COMPOSE,
                        {
                            text: SITE_NAME,
                            platform: Platform.FARCASTER,
                        },
                        true,
                    );
                    break;
                case SupportedMethod.BACK:
                    fireflyBridgeProvider.request(SupportedMethod.BACK, {}, true);
                    break;
                case SupportedMethod.BACK:
                    fireflyBridgeProvider.request(SupportedMethod.BACK, {});
                    break;
                default:
                    safeUnreachable(item.name);
                    break;
            }
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, 'Failed to call method'));
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
