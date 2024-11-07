import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import { EventId } from '@/providers/types/Telemetry.js';
import type { RedPacketMetadata } from '@/types/rp.js';

export function captureLuckyDropEvent(metadata: RedPacketMetadata) {
    return runInSafeAsync(() => {
        return TelemetryProvider.captureEvent(EventId.LUCKY_DROP_CREATE_SUCCESS, {
            wallet_address: metadata.sender.address,
            lucky_drop_id: metadata.rpid,
            amount: metadata.total,
            currency: metadata.token.symbol,
            winners: metadata.shares,
            chain_id: metadata.token.chainId.toString(),
            chain_name: metadata.network,
            distribution_rule: metadata.is_random ? 'random' : 'equal',
        });
    });
}
