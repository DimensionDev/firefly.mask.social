import type { __SiteAdaptorContext__ } from '@masknet/plugin-infra/content-script';
import type { __UIContext__ } from '@masknet/plugin-infra/dom';
import { EMPTY_ARRAY, PostIdentifier, UNDEFINED } from '@masknet/shared-base';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { SITE_URL } from '@/constants/index.js';

async function reject(): Promise<never> {
    throw new Error('Not implemented');
}

export function createMaskUIContext(context?: Partial<__UIContext__>): __UIContext__ {
    return {
        currentPersona: UNDEFINED,
        allPersonas: EMPTY_ARRAY,
        queryPersonaByProfile: reject,
        queryPersonaAvatar: async (identifiers): Promise<any> => {
            if (Array.isArray(identifiers)) return new Map();
            return undefined;
        },
        querySocialIdentity: reject,
        fetchJSON,
        openDashboard: reject,
        openPopupWindow: reject,
        signWithPersona: reject,
        hasPaymentPassword: reject,
        attachProfile: undefined,
        createPersona: reject,
        hasHostPermission: undefined,
        requestHostPermission: undefined,
        setCurrentPersonaIdentifier: undefined,
        setPluginMinimalModeEnabled: undefined,
        ...context,
    };
}

export function createMaskSiteAdaptorContext(context?: Partial<__SiteAdaptorContext__>): __SiteAdaptorContext__ {
    return {
        lastRecognizedProfile: UNDEFINED,
        currentVisitingProfile: UNDEFINED,
        currentNextIDPlatform: undefined,
        currentPersonaIdentifier: UNDEFINED,
        getPostURL: (identifier: PostIdentifier) => null,
        share: (text: string) => {
            ComposeModalRef.open({
                chars: text.replaceAll(/mask\.io/gi, SITE_URL),
            });
        },
        connectPersona: reject,
        getPostIdFromNewPostToast: undefined,
        getSearchedKeyword: undefined,
        getUserIdentity: undefined,
        postMessage: undefined,
        ...context,
    };
}
