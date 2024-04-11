import { farcasterClient } from '@/configs/farcasterClient.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';

export function getFarcasterSessionType() {
    const isCustodyWallet = FarcasterSession.isCustodyWallet(farcasterClient.session);
    const isGrantByPermission = FarcasterSession.isGrantByPermission(farcasterClient.session);
    return { isCustodyWallet, isGrantByPermission };
}
