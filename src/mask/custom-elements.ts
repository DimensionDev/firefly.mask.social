import '@/mask/setup/locale.js';
import '@/mask/setup/storage.js';
import '@/mask/setup/wallet.js';
import '@/mask/setup/theme.js';
import '@/mask/setup/custom-event-provider.js';
import '@/mask/plugin-host/enable.js';
import '@/mask/custom-elements/PageInspector.js';
import '@/mask/custom-elements/CalendarWidget.js';
import '@/mask/custom-elements/DecryptedPost.js';

import { setupBuildInfoManually } from '@masknet/flags/build-info';

import { setPluginDebuggerMessages } from '@/mask/message-host/index.js';

const channel =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
        ? 'beta'
        : process.env.NODE_ENV === 'production'
          ? 'stable'
          : 'insider';

setupBuildInfoManually({
    channel,
});

// plugin messages
if (process.env.NODE_ENV === 'development') {
    await import('@masknet/plugin-debugger/messages').then((module) =>
        setPluginDebuggerMessages(module.PluginDebuggerMessages),
    );
}
