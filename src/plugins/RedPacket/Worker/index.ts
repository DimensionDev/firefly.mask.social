import type { Plugin } from '@masknet/plugin-infra';

import { base } from '@/plugins/RedPacket/base.js';
import { setupDatabase } from '@/plugins/RedPacket/Worker/database.js';

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal, context) {
        context.startService(import('./services.js'));
        setupDatabase(context.getDatabaseStorage());
    },
};
export default worker;
