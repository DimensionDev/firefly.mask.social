'use client';

import { CrossIsolationMessages } from '@masknet/shared-base';
import { isTypedMessageText, makeTypedMessageText } from '@masknet/typed-message';
import { editTypedMessageMeta } from '@masknet/typed-message-react';
import { useEffect } from 'react';
import { useAsync } from 'react-use';

import { ComposeModalRef } from '@/modals/controls.js';

export default function CustomElements() {
    const { value } = useAsync(async () => {
        await import('@/mask/custom-elements.js');

        return true;
    }, []);

    useEffect(() => {
        if (!value) return;
        return CrossIsolationMessages.events.compositionDialogEvent.on((event) => {
            if (!event.open) return;

            const initialMetas = event.options?.initialMetas;
            const message = initialMetas
                ? Object.entries(initialMetas).reduce((message, [meta, data]) => {
                      return editTypedMessageMeta(message, (map) => map.set(meta, data));
                  }, makeTypedMessageText(''))
                : null;

            ComposeModalRef.open({
                type: 'compose',
                typedMessage: message && isTypedMessageText(message) ? message : null,
            });
        });
    }, [value]);

    return null;
}
