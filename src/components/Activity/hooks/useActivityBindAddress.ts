import { t } from '@lingui/macro';
import { isValidChainId as isValidSolanaChainId } from '@masknet/web3-shared-solana';
import { useContext } from 'react';
import { useAsyncFn } from 'react-use';

import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { useActivityClaimCondition } from '@/components/Activity/hooks/useActivityClaimCondition.js';
import { useActivityConnections } from '@/components/Activity/hooks/useActivityConnections.js';
import type { SocialSource } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { enqueueMessageFromError } from '@/helpers/enqueueMessage.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { AddWalletModalRef } from '@/modals/controls.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { captureActivityEvent } from '@/providers/telemetry/captureActivityEvent.js';
import { EventId } from '@/providers/types/Telemetry.js';
import { Network, SupportedMethod } from '@/types/bridge.js';

export function useActivityBindAddress(source: SocialSource, chainId: number) {
    const { onChangeAddress } = useContext(ActivityContext);
    const { refetch: refetchActivityClaimCondition } = useActivityClaimCondition(source);
    const { data: { connected = EMPTY_LIST } = {}, refetch } = useActivityConnections();
    return useAsyncFn(async () => {
        if (fireflyBridgeProvider.supported) {
            await runInSafeAsync(async () => {
                const address = await fireflyBridgeProvider.request(SupportedMethod.BIND_WALLET, {
                    type: isValidSolanaChainId(chainId) ? Network.Solana : Network.EVM,
                });
                onChangeAddress(address);
                captureActivityEvent(EventId.EVENT_CONNECT_WALLET_SUCCESS, {
                    wallet_address: address,
                });
                await refetchActivityClaimCondition();
                await refetch();
            });
            return;
        }
        try {
            const { response } = await AddWalletModalRef.openAndWaitForClose({
                connections: connected,
                platform: isValidSolanaChainId(chainId) ? 'solana' : 'evm',
            });
            if (response?.address) {
                onChangeAddress(response.address);
                captureActivityEvent(EventId.EVENT_CONNECT_WALLET_SUCCESS, {
                    wallet_address: response.address,
                });
            }
            await refetch();
        } catch (error) {
            enqueueMessageFromError(error, t`Failed to bind address.`, {
                error,
            });
            throw error;
        }
    }, [chainId, connected]);
}
