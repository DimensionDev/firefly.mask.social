import { RedPacketMetaKey } from '@masknet/plugin-redpacket';
import type { TypedMessage } from '@masknet/typed-message';

const RP_ENCRYPED_KEY = `${RedPacketMetaKey}:encrypted`;

export function hasRpPayload(message: TypedMessage | null) {
    return message?.meta?.has(RedPacketMetaKey);
}

export function isRpEncryped(message: TypedMessage | null) {
    if (hasRpPayload(message)) return message?.meta?.get(RP_ENCRYPED_KEY) === true;
    return false;
}

export function updateRpEncrypted<T extends TypedMessage>(message: T | null, encryped = true): T | null {
    if (hasRpPayload(message) && message?.meta) {
        return {
            ...message,
            meta: new Map([[RP_ENCRYPED_KEY, encryped], ...(message?.meta?.entries() ?? [])]),
        };
    }
    return message;
}
