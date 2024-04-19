import { RedPacketMetaKey } from '@masknet/plugin-redpacket';
import type { TypedMessage } from '@masknet/typed-message';

export function hasRpPayload(message: TypedMessage | null) {
    return message?.meta?.has(RedPacketMetaKey);
}

export function isRpEncryped(message: TypedMessage | null) {
    if (hasRpPayload(message)) return message?.meta?.get(`${RedPacketMetaKey}:encrypted`) === true;
    return false;
}

export function updateRpEncrypted<T extends TypedMessage>(message: T | null): T | null {
    if (hasRpPayload(message) && message?.meta) {
        return {
            ...message,
            meta: new Map([[`${RedPacketMetaKey}:encryped`, true], ...(message?.meta?.entries() ?? [])]),
        };
    }
    return message;
}
