import { RedPacketMetaKey } from '@masknet/plugin-redpacket';
import { isTypedMessageText, makeTypedMessageText } from '@masknet/typed-message';
import { editTypedMessageMeta } from '@masknet/typed-message-react';

export function getTypedMessageText(metas?: Record<string, unknown>) {
    const message = metas
        ? Object.entries(metas).reduce((message, [meta, data]) => {
              return editTypedMessageMeta(message, (map) => map.set(meta, data));
          }, makeTypedMessageText(''))
        : null;

    if (!message || !isTypedMessageText(message)) return null;

    return message;
}

export function getTypedMessageRedPacket(metas?: Record<string, unknown>) {
    const message = getTypedMessageText(metas);
    if (!message) return null;

    const hasRedPacketPayload = message?.meta?.has(RedPacketMetaKey);
    if (!hasRedPacketPayload) return null;

    editTypedMessageMeta(message, (map) => {
        map.forEach((_, key) => {
            if (key !== RedPacketMetaKey) map.delete(key);
        });
    });

    return message;
}
