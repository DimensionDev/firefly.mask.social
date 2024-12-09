import { PostIdentifier, ProfileIdentifier } from '@masknet/shared-base';

import { EMPTY_ARRAY, UNDEFINED } from '@/constants/subscription.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { createSubscriptionFromValueRef } from '@/helpers/subscription.js';
import { ValueRef } from '@/libs/ValueRef.js';
import type { __SiteAdaptorContext__, __UIContext__, IdentityResolved } from '@/mask/bindings/index.js';
import { createRejectCallback } from '@/mask/helpers/createRejectCallback.js';

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

const myProfileRef = new ValueRef<IdentityResolved | undefined>(undefined);
const myProfileSub = createSubscriptionFromValueRef(myProfileRef);

export function updateMyProfile(profile: IdentityResolved) {
    myProfileRef.value = profile;
}

export function getCurrentProfile() {
    return myProfileSub.getCurrentValue();
}

export function createMaskSiteAdaptorContext(context?: Partial<__SiteAdaptorContext__>): __SiteAdaptorContext__ {
    return {
        lastRecognizedProfile: myProfileSub,
        currentVisitingProfile: UNDEFINED,
        currentNextIDPlatform: undefined,
        currentPersonaIdentifier: UNDEFINED,
        getPostURL: (identifier: PostIdentifier) => null,
        getProfileURL: (identifier: ProfileIdentifier) => null,
        connectPersona: createRejectCallback('connectPersona'),
        getPostIdFromNewPostToast: undefined,
        getSearchedKeyword: undefined,
        getUserIdentity: undefined,
        postMessage: undefined,
        publishPost: undefined,
        ...context,
    };
}
