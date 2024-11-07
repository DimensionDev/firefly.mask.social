import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import { EventId } from '@/providers/types/Telemetry.js';

export function captureConnectWalletEvent(
    eventId:
        | EventId.CONNECT_WALLET_SUCCESS
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
        evmAddress?: string;
        solanaAddress?: string;
    },
) {
    return runInSafeAsync(async () => {
        return TelemetryProvider.captureEvent(eventId, {
            wallet_address: options?.evmAddress,
            solana_address: options?.solanaAddress,
        });
    });
}
