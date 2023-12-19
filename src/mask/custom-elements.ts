/* eslint simple-import-sort/imports: 0 */

// setup
import '@/mask/setup/locale.js';
import '@/mask/setup/storage.js';
import '@/mask/setup/wallet.js';
import '@/mask/setup/theme.js';
import '@/mask/setup/custom-event-provider.js';
import '@/mask/plugin-host/enable.js';

// custom elements
import '@/mask/custom-elements/PageInspector.js';
import '@/mask/custom-elements/CalendarWidget.js';
import '@/mask/custom-elements/DecryptedPost.js';

import { setPluginDebuggerMessages } from '@/mask/message-host/index.js';

// plugin messages
if (process.env.NODE_ENV === 'development') {
    await import('@masknet/plugin-debugger/messages').then((module) =>
        setPluginDebuggerMessages(module.PluginDebuggerMessages),
    );
}
