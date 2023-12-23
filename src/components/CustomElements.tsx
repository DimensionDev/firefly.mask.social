'use client';

import { CrossIsolationMessages } from '@masknet/shared-base';
import { useEffect } from 'react';
import { useAsync } from 'react-use';

import { getTypedMessageRedPacket } from '@/helpers/getTypedMessage.js';
import { ComposeModalRef } from '@/modals/controls.js';

export default function CustomElements() {
    const { value } = useAsync(async () => {
        // storage must be imported before custom-elements
        await import('@/mask/setup/storage.js');
        await import('@/mask/custom-elements.js');

        return true;
    }, []);

    useEffect(() => {
        if (!value) return;
        return CrossIsolationMessages.events.compositionDialogEvent.on((event) => {
            if (!event.open) return;

            ComposeModalRef.open({
                type: 'compose',
                typedMessage: getTypedMessageRedPacket(event.options?.initialMetas),
            });
        });
    }, [value]);

    return null;
}
