import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import { EventId } from '@/providers/types/Telemetry.js';

export function captureConnectWalletEvent(
    eventId:
        | EventId.CONNECT_WALLET_SUCCESS
        | EventId.CONNECT_WALLET_SUCCESS_METAMASK
        | EventId.CONNECT_WALLET_SUCCESS_RABBY
        | EventId.CONNECT_WALLET_SUCCESS_WALLET_CONNECT
        | EventId.CONNECT_WALLET_SUCCESS_BINANCE
        | EventId.CONNECT_WALLET_SUCCESS_OKX
        | EventId.CONNECT_WALLET_SUCCESS_ZERION
        | EventId.CONNECT_WALLET_SUCCESS_RAINBOW
        | EventId.CONNECT_WALLET_SUCCESS_PARTICLE
        | EventId.CONNECT_WALLET_SUCCESS_PHANTOM
        | EventId.CONNECT_WALLET_SUCCESS_COINBASE,
    options?: {
        name?: string;
        evmAddress?: string;
        solanaAddress?: string;
    },
) {
    return runInSafeAsync(async () => {
        const parameters = {
            wallet_name: options?.name ?? 'unknown',
            wallet_address: options?.evmAddress,
            solana_address: options?.solanaAddress,
        };

        if (eventId !== EventId.CONNECT_WALLET_SUCCESS) {
            await TelemetryProvider.captureEvent(EventId.CONNECT_WALLET_SUCCESS, parameters);
        }

        return TelemetryProvider.captureEvent(eventId, parameters);
    });
}
