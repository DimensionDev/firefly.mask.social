import { farcasterClient } from '@/configs/farcasterClient.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';

export function getFarcasterSessionType() {
    return farcasterClient.withSession((session) => {
        const isCustodyWallet = FarcasterSession.isCustodyWallet(session);
        const isGrantByPermission = FarcasterSession.isGrantByPermission(session);
        return {
            /** @deprecated */
            isCustodyWallet,
            isGrantByPermission,
        };
    });
}
