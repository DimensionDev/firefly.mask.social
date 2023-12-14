'use client';

import { useAsync } from 'react-use';

import { setPluginDebuggerMessages } from '@/mask/message-host/index.js';

export default function CustomElements() {
    useAsync(async () => {
        // setup mask runtime
        await import('@/mask/setup/locale.js');
        await import('@masknet/flags/build-info').then((module) => {
            const channel =
                process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
                    ? 'beta'
                    : process.env.NODE_ENV === 'production'
                      ? 'stable'
                      : 'insider';

            module.setupBuildInfoManually({
                channel,
            });
        });
        await import('@/mask/setup/storage.js');
        await import('@/mask/setup/wallet.js');
        await import('@/mask/setup/theme.js');
        await import('@/mask/plugin-host/enable.js');

        // define custom elements
        await import('@/mask/custom-elements/PageInspector.js');
        await import('@/mask/custom-elements/CalendarWidget.js');
        await import('@/mask/custom-elements/DecryptedPost.js');

        // plugin messages
        await import('@masknet/plugin-debugger/messages').then((module) =>
            setPluginDebuggerMessages(module.PluginDebuggerMessages),
        );
    }, []);

    return null;
}
