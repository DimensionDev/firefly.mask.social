import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { ActionsRegistryResponse } from '@/providers/types/Blink.js';

class Registry {
    async fetchActionsRegistryConfig(): Promise<ActionsRegistryResponse> {
        const response = await fetchJSON<{ success: boolean; data: ActionsRegistryResponse }>(
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

export const BlinkRegistry = new Registry();
