import { runInSafe } from '@/helpers/runInSafe.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import { EventId } from '@/providers/types/Telemetry.js';

export function captureTipsEvent() {
    runInSafe(async () => {
        TelemetryProvider.captureEvent(EventId.TIPS_SEND_SUCCESS, {
            source_wallet_address: '',
            target_wallet_address: '',
            source_firefly_account_id: '',
            target_firefly_account_id: '',
            amount: 0,
            currency: '',
            chain_id: '',
            chain_name: '',
        });
    });
}
