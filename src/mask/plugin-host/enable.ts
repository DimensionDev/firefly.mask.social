import '@/mask/plugin-host/register.js';

import {
    __setSiteAdaptorContext__,
    __setUIContext__,
    startPluginSiteAdaptor,
} from '@masknet/plugin-infra/content-script';
import { BooleanPreference, createI18NBundle, i18NextInstance } from '@masknet/shared-base';
import { Emitter } from '@servie/events';

import { EnhanceableSite } from '@/constants/enum.js';
import { setupReactShadowRootEnvironment } from '@/mask/bindings/components.js';
import { createMaskSiteAdaptorContext, createMaskUIContext } from '@/mask/helpers/createMaskContext.js';
import { createRejectCallback } from '@/mask/helpers/createRejectCallback.js';
import { indexedDBStorage, inMemoryStorage } from '@/mask/setup/storage.js';

__setUIContext__(createMaskUIContext());
__setSiteAdaptorContext__(createMaskSiteAdaptorContext());

startPluginSiteAdaptor(EnhanceableSite.Firefly, {
    minimalMode: {
        events: new Emitter(),
        isEnabled: () => BooleanPreference.False,
    },
    addI18NResource(plugin, resource) {
        createI18NBundle(plugin, resource)(i18NextInstance);
    },
    createContext(id, def, signal) {
        return {
            createKVStorage(type, defaultValues) {
                if (type === 'memory') return inMemoryStorage(id, defaultValues, signal);
                else return indexedDBStorage(id, defaultValues, signal);
            },
            setMinimalMode(enabled) {
                console.warn('setMinimalMode is ignored.');
            },
            connectPersona: createRejectCallback('connectPersona'),
            createPersona: createRejectCallback('createPersona'),
        };
    },
    permission: {
        hasPermission: async () => false,
        events: new Emitter(),
    },
});

setupReactShadowRootEnvironment({ mode: 'open' }, []);
