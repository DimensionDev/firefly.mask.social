import /* webpackSync: true */ '@/mask/background-worker/message-port.js';

import { setupBuildInfo } from '@masknet/flags/build-info';

await setupBuildInfo();
await import(/* webpackMode: 'eager' */ './index.js');
