'use client';

import { CrossIsolationMessages } from '@masknet/shared-base';
import { useEffect } from 'react';
import { useAsync, useUpdateEffect } from 'react-use';
import { useAccount, useChainId } from 'wagmi';

import { NODE_ENV, VERCEL_NEV } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { connectMaskWithWagmi } from '@/helpers/connectWagmiWithMask.js';
import { getTypedMessageRedPacket } from '@/helpers/getTypedMessage.js';
import { ComposeModalRef } from '@/modals/controls.js';

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

        console.log('setup CustomElements, storage');
        // storage must be imported before custom-elements
        try {
            await import('@/mask/setup/storage.js').catch((err) => {
                debugger;
                console.log('err storage', err);
            });
        } catch (err) {
            console.log('err storage', err);
        }
        console.log('setup CustomElements, custom elements');
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
                rpPayload: event.options?.pluginMeta?.payloadImage ? event.options.pluginMeta : undefined,
            });
        });
    }, [value]);

    useUpdateEffect(() => {
        if (!account.address || !chainId || !value) return;
        connectMaskWithWagmi();
    }, [account.address, chainId, value]);

    return null;
}
