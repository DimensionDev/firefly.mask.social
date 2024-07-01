import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { ActionsRegistryConfig } from '@/providers/blinks/type.js';

class BlinksRegister {
    async fetchActionsRegistryConfig(): Promise<ActionsRegistryConfig> {
        const response = await fetchJSON<{ success: boolean; data: ActionsRegistryConfig }>(
            '/api/solana/action/register',
        );
        if (response.success) {
            return response.data;
        }
        return {
            actions: [],
        };
    }
}

export const BlinksRegisterProvider = new BlinksRegister();
