import { RedPacketMetaKey } from '@masknet/plugin-redpacket';
import type { TypedMessage } from '@masknet/typed-message';

export function hasRpPayload(message: TypedMessage | null) {
    return message?.meta?.has(RedPacketMetaKey);
}

export function removeRpPayload<T extends TypedMessage>(message: T | null): T | null {
    if (hasRpPayload(message) && message?.meta) {
        return {
            ...message,
            meta: new Map([...(message?.meta?.entries() ?? [])].filter((x) => x[0] !== RedPacketMetaKey)),
        };
    }
    return message;
}
