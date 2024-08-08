'use client';

import { CrossIsolationMessages } from '@masknet/shared-base';
import { useEffect } from 'react';
import { useAsync, useUpdateEffect } from 'react-use';
import { useAccount, useChainId } from 'wagmi';

import { NODE_ENV, VERCEL_NEV } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { connectMaskWithWagmi } from '@/helpers/connectWagmiWithMask.js';
import { getTypedMessageRedPacket } from '@/helpers/getTypedMessage.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export default function CustomElements() {
    const account = useAccount();
    const chainId = useChainId();

    const { value } = useAsync(async () => {
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

            updateTypedMessage(getTypedMessageRedPacket(event.options?.initialMetas));
            if (event.options?.pluginMeta?.payloadImage) {
                updateRpPayload(event.options.pluginMeta);
            }
        });
    }, [updateRpPayload, updateTypedMessage, value]);

    useUpdateEffect(() => {
        if (!account.address || !chainId || !value) return;
        connectMaskWithWagmi();
    }, [account.address, chainId, value]);

    return null;
}
