import { ChainId } from '@masknet/web3-shared-solana';
import { getClient } from '@wagmi/core';
import { v4 as uuid } from 'uuid';

import { config } from '@/configs/wagmiClient.js';
import { NODE_ENV, STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { NotImplementedError } from '@/constants/error.js';
import { bom } from '@/helpers/bom.js';
import { resolveWalletAdapter } from '@/providers/solana/resolveWalletAdapter.js';
import type { Events, Safary } from '@/providers/types/Safary.js';
import { Provider } from '@/providers/types/Telemetry.js';
import { useDeveloperSettingsState } from '@/store/useDeveloperSettingsStore.js';
import { useFireflyStateStore } from '@/store/useProfileStore.js';

function formatParameter(key: string, value: unknown): [string, unknown] {
    if (typeof value === 'boolean') {
        return [key, value === true ? 'Y' : 'N'];
    }
    return [key, value];
}

class SafaryTelemetry extends Provider<Events, never> {
    private latestEventId: string | null = null;

    private get sdk() {
        if (typeof bom.window?.safary === 'undefined') return null;
        return bom.window.safary as Safary;
    }

    getPublicParameters() {
        const evmClient = getClient(config);
        const solanaAdaptor = resolveWalletAdapter();
        return {
            public_uuid: uuid(),
            public_previous_uuid: this.latestEventId,

            public_ua: bom.navigator?.userAgent,
            public_href: bom.location?.href,

            public_evm_address: evmClient?.account?.address,
            public_evm_chain_id: evmClient?.chain.id,
            public_solana_chain_id: ChainId.Mainnet,
            public_solana_address: solanaAdaptor.publicKey?.toBase58(),

            public_account_id: useFireflyStateStore.getState().currentProfileSession?.profileId,
            public_use_development_api: useDeveloperSettingsState.getState().useDevelopmentAPI,
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

            // update the latest event id
            this.latestEventId = publicParameters.public_uuid;

            await this.sdk.track({
                eventType: name,
                eventName: name.replaceAll(/_/g, ' '),
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
