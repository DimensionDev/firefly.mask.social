/* eslint simple-import-sort/imports: 0 */

// setup
import '@/mask/setup/locale.js';
import '@/mask/setup/wallet.js';
import '@/mask/setup/theme.js';
import '@/mask/setup/custom-event-provider.js';
import '@/mask/setup/overwrite-modals.js';
import '@/mask/plugin-host/enable.js';

// custom elements
import '@/mask/custom-elements/PageInspector.js';
import '@/mask/custom-elements/CalendarWidget.js';
import '@/mask/custom-elements/DecryptedPostInspector.js';

// no plugin avaiable for post inspector
// import '@/mask/custom-elements/PostInspector.js';

import { setPluginDebuggerMessages } from '@/mask/message-host/index.js';
import { env } from '@/constants/env.js';
import { NODE_ENV } from '@/constants/enum.js';

// plugin messages
if (env.shared.NODE_ENV === NODE_ENV.Development) {
    await import('@masknet/plugin-debugger/messages').then((module) =>
        setPluginDebuggerMessages(module.PluginDebuggerMessages),
    );
}
