import { registerPlugin } from '@masknet/plugin-infra';

import { base } from '@/plugins/RedPacket/base.js';

registerPlugin({
    ...base,
    SiteAdaptor: {
        load: () => import('./SiteAdaptor/index.jsx'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot?.accept('./SiteAdaptor', () => hot(import('./SiteAdaptor/index.jsx'))),
    },
    Worker: {
        load: () => import('./Worker/index.js'),
        hotModuleReload: (hot) => import.meta.webpackHot?.accept('./Worker', () => hot(import('./Worker/index.js'))),
    },
});
