import { registerPlugin } from '@masknet/plugin-infra';

import { base } from '@/mask/plugins/red-packet/register/base.js';

registerPlugin({
    ...base,
    SiteAdaptor: {
        load: () => import('./entry.js'),
        hotModuleReload: (hot) => import.meta.webpackHot?.accept('./SiteAdaptor', () => hot(import('./entry.js'))),
    },
});
