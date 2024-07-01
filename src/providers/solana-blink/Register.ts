import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { ActionsRegistryConfig } from '@/providers/solana-blink/type.js';

class SolanaBlinksRegister {
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

export const SolanaBlinksRegisterProvider = new SolanaBlinksRegister();
