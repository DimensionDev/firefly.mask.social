import { WalletId } from '@/constants/reown.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import type { getPublicParameters } from '@/providers/telemetry/getPublicParameters.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import { type ConnectWalletEventParameters, EventId } from '@/providers/types/Telemetry.js';

function getEvent(
    walletId: WalletId,
    evmAddress?: string,
    solanaAddress?: string,
): {
    eventId: EventId;
    parameters: Omit<ConnectWalletEventParameters, keyof ReturnType<typeof getPublicParameters>>;
} {
    const evm = [
        WalletId.MetaMask,
        WalletId.WalletConnect,
        WalletId.Binance,
        WalletId.OKX,
        WalletId.Zerion,
        WalletId.Rainbow,
    ];
    const both = [WalletId.FireflyWallet, WalletId.Phantom];

    const resolveEventId = createLookupTableResolver(
        {
            [WalletId.Injected]: EventId.CONNECT_WALLET_SUCCESS,
            [WalletId.MetaMask]: EventId.CONNECT_WALLET_SUCCESS_METAMASK,
            [WalletId.Rabby]: EventId.CONNECT_WALLET_SUCCESS_RABBY,
            [WalletId.WalletConnect]: EventId.CONNECT_WALLET_SUCCESS_WALLET_CONNECT,
            [WalletId.Binance]: EventId.CONNECT_WALLET_SUCCESS_BINANCE,
            [WalletId.OKX]: EventId.CONNECT_WALLET_SUCCESS_OKX,
            [WalletId.Zerion]: EventId.CONNECT_WALLET_SUCCESS_ZERION,
            [WalletId.Rainbow]: EventId.CONNECT_WALLET_SUCCESS_RAINBOW,
            [WalletId.FireflyWallet]: EventId.CONNECT_WALLET_SUCCESS_PARTICLE,
            [WalletId.Phantom]: EventId.CONNECT_WALLET_SUCCESS_PHANTOM,
            [WalletId.CoinBase]: EventId.CONNECT_WALLET_SUCCESS_COINBASE,
        },
        () => EventId.CONNECT_WALLET_SUCCESS,
    );

    if (both.includes(walletId)) {
        return {
            eventId: resolveEventId(walletId),
            parameters: {
                wallet_type: 'all',
                wallet_id: walletId,
                wallet_address: evmAddress,
                solana_address: solanaAddress,
            },
        };
    }
    if (evm.includes(walletId)) {
        return {
            eventId: resolveEventId(walletId),
            parameters: {
                wallet_type: 'evm',
                wallet_id: walletId,
                wallet_address: evmAddress,
            },
        };
    }

    return {
        eventId: resolveEventId(walletId),
        parameters: {
            wallet_type: 'solana',
            wallet_id: walletId,
            solana_address: solanaAddress,
        },
    };
}

export function captureConnectWalletEvent(
    walletId: WalletId,
    options?: {
        evmAddress?: string;
        solanaAddress?: string;
    },
) {
    return runInSafeAsync(async () => {
        const event = getEvent(walletId, options?.evmAddress, options?.solanaAddress);
        return TelemetryProvider.captureEvent(event.eventId, event.parameters);
    });
}
