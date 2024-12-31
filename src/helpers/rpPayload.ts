import type { TypedMessage } from '@masknet/typed-message';

import { RedPacketEncryptedKey, RedPacketMetaKey } from '@/constants/rp.js';
import type { RedPacketMetadata } from '@/types/rp.js';

export function hasRpPayload(message: TypedMessage | null) {
    return message?.meta?.has(RedPacketMetaKey);
}

export function getRpMetadata(message: TypedMessage | null) {
    const metadata = message?.meta?.get(RedPacketMetaKey) ?? null;
    return metadata as RedPacketMetadata | null;
}

export function isRpEncrypted(message: TypedMessage | null) {
    if (hasRpPayload(message)) return message?.meta?.get(RedPacketEncryptedKey) === true;
    return false;
}

export function updateRpEncrypted<T extends TypedMessage>(message: T | null, encrypted = true): T | null {
    if (hasRpPayload(message) && message?.meta) {
        return {
            ...message,
            meta: new Map([[RedPacketEncryptedKey, encrypted], ...(message?.meta?.entries() ?? [])]),
        };
    }
    return message;
}
