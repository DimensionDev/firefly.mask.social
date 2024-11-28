import { isTypedMessageText, makeTypedMessageText } from '@masknet/typed-message';
import { editTypedMessageMeta } from '@masknet/typed-message-react';

import { hasRpPayload } from '@/mask/plugins/red-packet/helpers/rpPayload.js';
import { RedPacketMetaKey } from '@/mask/plugins/red-packet/constants.js';

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

    if (!hasRpPayload(message)) return null;

    editTypedMessageMeta(message, (map) => {
        map.forEach((_, key) => {
            if (key !== RedPacketMetaKey) map.delete(key);
        });
    });

    return message;
}
