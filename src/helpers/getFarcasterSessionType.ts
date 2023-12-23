import { farcasterClient } from '@/configs/farcasterClient.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';

export function getFarcasterSessionType() {
    const session = farcasterClient.getSession();
    const isCustodyWallet = FarcasterSession.isCustodyWallet(session);
    const isGrantByPermission = FarcasterSession.isGrantByPermission(session);
    return { isCustodyWallet, isGrantByPermission };
}
