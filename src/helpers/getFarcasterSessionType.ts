import { FarcasterSession } from '@/providers/farcaster/Session.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';

export function getFarcasterSessionType() {
    return farcasterSessionHolder.withSession((session) => {
        const isCustodyWallet = FarcasterSession.isCustodyWallet(session);
        const isGrantByPermission = FarcasterSession.isGrantByPermission(session);
        return {
            /** @deprecated */
            isCustodyWallet,
            isGrantByPermission,
        };
    });
}
