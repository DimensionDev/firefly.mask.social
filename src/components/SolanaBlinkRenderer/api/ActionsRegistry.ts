import { Action } from '@/components/SolanaBlinkRenderer/api/Action.js';

export class ActionsRegistry {
    private static instance: ActionsRegistry | null = null;
    private actionsByHost: Record<string, RegisteredAction>;

    private constructor(config?: ActionsRegistryConfig) {
        this.actionsByHost = config ? Object.fromEntries(config.actions.map((action) => [action.host, action])) : {};
    }

    public static getInstance(config?: ActionsRegistryConfig): ActionsRegistry {
        if (this.instance === null) {
            this.instance = new ActionsRegistry(config);
        }
        return this.instance;
    }

    public async init(): Promise<void> {
        const config = await fetchActionsRegistryConfig();
        this.actionsByHost = Object.fromEntries(config.actions.map((action) => [action.host, action]));
    }

    public lookup(actionUrl: string | URL): RegisteredAction | null {
        try {
            const urlObj = new URL(actionUrl);
            const host = urlObj.host;
            return this.actionsByHost[host] ?? null;
        } catch (e) {
            console.error(`Failed to lookup action for URL: ${actionUrl}`, e);
            return null;
        }
    }
}

export interface ActionsRegistryConfig {
    actions: RegisteredAction[];
}

export interface RegisteredAction {
    host: string;
    state: 'trusted' | 'malicious';
}

export type ExtendedActionState = RegisteredAction['state'] | 'unknown';

export const getExtendedActionState = (actionOrUrl: Action | string): ExtendedActionState => {
    return (
        ActionsRegistry.getInstance().lookup(typeof actionOrUrl === 'string' ? actionOrUrl : actionOrUrl.url)?.state ??
        'unknown'
    );
};

async function fetchActionsRegistryConfig(): Promise<ActionsRegistryConfig> {
    try {
        const response = await fetch('https://actions-registry.dialectapi.to/all');

        if (!response.ok) {
            console.error('Failed to fetch actions registry config', await response.json());
            return { actions: [] };
        }

        return await response.json();
    } catch (e) {
        console.error('Failed to fetch actions registry config', e);
        return { actions: [] };
    }
}
