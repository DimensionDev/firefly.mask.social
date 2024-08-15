import { ChainId } from '@masknet/web3-shared-solana';
import { getClient } from '@wagmi/core';

import { config } from '@/configs/wagmiClient.js';
import { NODE_ENV, STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { NotImplementedError } from '@/constants/error.js';
import { getNavigatorSafe, getWindowSafe } from '@/helpers/bom.js';
import { resolveWalletAdapter } from '@/providers/solana/resolveWalletAdapter.js';
import type { Events, Safary } from '@/providers/types/Safary.js';
import { Provider } from '@/providers/types/Telemetry.js';
import { useDeveloperSettingsState } from '@/store/useDeveloperSettingsStore.js';

function formatParameter(key: string, value: unknown): [string, unknown] {
    if (typeof value === 'boolean') {
        return [key, value === true ? 'Y' : 'N'];
    }
    return [key, value];
}

class SafaryTelemetry extends Provider<Events, never> {
    private get sdk() {
        const win = getWindowSafe();
        if (typeof win?.safary === 'undefined') return null;
        return win.safary as Safary;
    }

    getPublicParameters() {
        const evmClient = getClient(config);
        const solanaAdaptor = resolveWalletAdapter();

        return {
            ua: getNavigatorSafe()?.userAgent,
            use_development_api: useDeveloperSettingsState.getState().useDevelopmentAPI,
            href: getWindowSafe()?.location.href,
            evm_address: evmClient?.account?.address,
            evm_chain_id: evmClient?.chain.id,
            solana_chain_id: ChainId.Mainnet,
            solana_address: solanaAdaptor.publicKey?.toBase58(),
        };
    }

    override async captureEvent<T extends keyof Events>(name: T, parameters: Events[T]['parameters']): Promise<void> {
        if (env.external.NEXT_PUBLIC_TELEMETRY === STATUS.Disabled) {
            return;
        }

        if (env.shared.NODE_ENV === NODE_ENV.Development) {
            console.info('[safary] capture event:', name, parameters);
            return;
        }

        if (!this.sdk) {
            console.error('[safary] safary SDK not available. failed to capture event:', name, parameters);
            return;
        }

        try {
            const publicParameters = this.getPublicParameters();
            const formattedParameters = Object.fromEntries(
                Object.entries(parameters).map(([key, value]) => formatParameter(key, value)),
            );

            await this.sdk.track({
                eventType: name,
                eventName: name,
                parameters: {
                    ...publicParameters,
                    ...formattedParameters,
                } as unknown as Events[T]['parameters'],
            });
        } catch (error) {
            console.error('[safary] failed to capture event:', name, parameters);
            throw error;
        }
    }

    override async captureException(): Promise<void> {
        throw new NotImplementedError();
    }
}

export const SafaryTelemetryProvider = new SafaryTelemetry();
