'use client';

import { useAsync } from 'react-use';

export function CustomElements() {
    useAsync(async () => {
        // console.log('DEBUG: custom elements');
        // console.log(process.env.ENABLE_MASK_WEB_COMPONENTS);

        // if (!process.env.ENABLE_MASK_WEB_COMPONENTS) return;

        // setup mask runtime
        await import('@/mask/setup/locale.js');
        await import('@masknet/flags/build-info').then((x) => x.setupBuildInfo());
        await import('@/mask/setup/storage.js');
        await import('@/mask/setup/wallet.js');
        await import('@/mask/plugin-host/enable.js');

        // define custom elements
        await import('@/mask/custom-elements/PageInspector.js');
        await import('@/mask/custom-elements/CalendarWidget.js');
        await import('@/mask/custom-elements/DecryptedPost.js');
    }, []);

    return null;
}
