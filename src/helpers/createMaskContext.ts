import { delay } from '@masknet/kit';
import type { __SiteAdaptorContext__ } from '@masknet/plugin-infra/content-script';
import type { __UIContext__ } from '@masknet/plugin-infra/dom';
import { TransactionConfirmModal } from '@masknet/shared';
import { EMPTY_ARRAY, PostIdentifier, UNDEFINED } from '@masknet/shared-base';

import type { SocialPlatform } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { createRejectCallback } from '@/helpers/createRejectCallback.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { ComposeModalRef } from '@/modals/controls.js';

export function createMaskUIContext(context?: Partial<__UIContext__>): __UIContext__ {
    return {
        currentPersona: UNDEFINED,
        allPersonas: EMPTY_ARRAY,
        queryPersonaByProfile: createRejectCallback('queryPersonaByProfile'),
        queryPersonaAvatar: async (identifiers): Promise<any> => {
            if (Array.isArray(identifiers)) return new Map();
            return undefined;
        },
        querySocialIdentity: createRejectCallback('querySocialIdentity'),
        fetchJSON,
        openDashboard: createRejectCallback('openDashboard'),
        openPopupWindow: createRejectCallback('openPopupWindow'),
        signWithPersona: createRejectCallback('signWithPersona'),
        hasPaymentPassword: createRejectCallback('hasPaymentPassword'),
        attachProfile: undefined,
        createPersona: createRejectCallback('createPersona'),
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
        share: async (text: string, source?: string) => {
            TransactionConfirmModal.close();
            await delay(300);
            ComposeModalRef.open({
                chars: text.replaceAll(/mask\.io/gi, SITE_URL),
                source: source as SocialPlatform,
            });
        },
        connectPersona: createRejectCallback('connectPersona'),
        getPostIdFromNewPostToast: undefined,
        getSearchedKeyword: undefined,
        getUserIdentity: undefined,
        postMessage: undefined,
        ...context,
    };
}
