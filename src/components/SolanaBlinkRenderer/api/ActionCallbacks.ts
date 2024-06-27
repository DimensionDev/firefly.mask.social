import type { Action } from '@/components/SolanaBlinkRenderer/api/Action.js';

export interface ActionCallbacksConfig {
    onActionMount: (action: Action, originalUrl: string, type: 'trusted' | 'malicious' | 'unknown') => void;
}
