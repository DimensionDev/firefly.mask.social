'use client';

import { useEffect } from 'react';
import { useAsync } from 'react-use';

import { NODE_ENV, VERCEL_NEV } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { CrossIsolationMessages } from '@/mask/bindings/index.js';
import { getTypedMessageRedPacket } from '@/mask/plugins/red-packet/helpers/getTypedMessage.js';
import { getRpMetadata } from '@/mask/plugins/red-packet/helpers/rpPayload.js';
import { captureLuckyDropEvent } from '@/providers/telemetry/captureLuckyDropEvent.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export default function CustomElements() {
    const { value = false } = useAsync(async () => {
        await import('@masknet/flags/build-info').then((module) => {
            module.setupBuildInfoManually({
                channel:
                    env.external.NEXT_PUBLIC_VERCEL_ENV === VERCEL_NEV.Preview
                        ? 'stable'
                        : env.shared.NODE_ENV === NODE_ENV.Production
                          ? 'stable'
                          : 'insider',
            });
        });

        // storage must be imported before custom-elements
        await import('@/mask/setup/storage.js');
        await import('@/mask/custom-elements.js');

        return true;
    }, []);

    const { updateTypedMessage, updateRpPayload } = useComposeStateStore();

    useEffect(() => {
        if (!value) return;
        return CrossIsolationMessages.events.compositionDialogEvent.on((event) => {
            if (!event.open) return;

            const message = getTypedMessageRedPacket(event.options?.initialMetas);
            updateTypedMessage(message);

            const pluginMeta = event.options?.pluginMeta;
            if (pluginMeta?.payloadImage) updateRpPayload(pluginMeta);

            const metadata = getRpMetadata(message);
            if (metadata) captureLuckyDropEvent(metadata);
        });
    }, [updateRpPayload, updateTypedMessage, value]);

    return null;
}
