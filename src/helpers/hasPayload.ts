import { RedPacketMetaKey } from '@masknet/plugin-redpacket';
import type { TypedMessage } from '@masknet/typed-message';

export function hasRpPayload(message: TypedMessage | null) {
    return message?.meta?.has(RedPacketMetaKey);
}
