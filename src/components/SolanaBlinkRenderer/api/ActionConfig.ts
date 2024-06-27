import { type Action, ActionComponent } from '@/components/SolanaBlinkRenderer/api/Action.js';

export interface ActionContext {
    originalUrl: string;
    action: Action;
    actionType: 'trusted' | 'malicious' | 'unknown';
    triggeredLinkedAction: ActionComponent;
}

export interface ActionAdapter {
    connect: (context: ActionContext) => Promise<string | null>;
    signTransaction: (tx: string, context: ActionContext) => Promise<{ signature: string } | { error: string }>;
    confirmTransaction: (signature: string, context: ActionContext) => Promise<void>;
}
