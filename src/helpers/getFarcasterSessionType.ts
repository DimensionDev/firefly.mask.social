import { warpcastClient } from '@/configs/warpcastClient.js';
import { WarpcastSession } from '@/providers/warpcast/Session.js';

export function getFarcasterSessionType() {
    const session = warpcastClient.getSessionRequired();
    const isCustodyWallet = WarpcastSession.isCustodyWallet(session);
    const isGrantByPermission = WarpcastSession.isGrantByPermission(session);
    return { isCustodyWallet, isGrantByPermission };
}
