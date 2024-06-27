import type { ExtendedActionState } from '@/components/SolanaBlinkRenderer/api/ActionsRegistry.js';

export type SecurityLevel = 'only-trusted' | 'non-malicious' | 'all';

export const checkSecurity = (state: ExtendedActionState, securityLevel: SecurityLevel): boolean => {
    switch (securityLevel) {
        case 'only-trusted':
            return state === 'trusted';
        case 'non-malicious':
            return state !== 'malicious';
        case 'all':
            return true;
    }
};
