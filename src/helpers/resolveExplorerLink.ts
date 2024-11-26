import urlcat from 'urlcat';

import { EVMExplorerResolver } from '@/mask/bindings/index.js';

const EXPLORER_CONFIG: Record<number, string> = {
    [84532]: 'https://sepolia.basescan.org',
};

export function resolveExplorerLink(chainId: number, id: string, type: 'address' | 'tx') {
    const fn = {
        address: EVMExplorerResolver.addressLink.bind(EVMExplorerResolver),
        tx: EVMExplorerResolver.transactionLink.bind(EVMExplorerResolver),
    }[type];
    const url = fn(chainId, id);
    if (!url && EXPLORER_CONFIG[chainId]) {
        return urlcat(EXPLORER_CONFIG[chainId], `/:type/:id`, {
            type,
            id,
        });
    }
    return url;
}
