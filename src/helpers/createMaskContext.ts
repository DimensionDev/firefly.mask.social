import { delay } from '@masknet/kit';
import type { __SiteAdaptorContext__ } from '@masknet/plugin-infra/content-script';
import type { __UIContext__, IdentityResolved } from '@masknet/plugin-infra/dom';
import { TransactionConfirmModal } from '@masknet/shared';
import { PostIdentifier, ProfileIdentifier } from '@masknet/shared-base';

import type { SocialSource } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { EMPTY_ARRAY, UNDEFINED } from '@/constants/subscription.js';
import { createRejectCallback } from '@/helpers/createRejectCallback.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { createSubscriptionFromValueRef } from '@/helpers/subscription.js';
import { ValueRef } from '@/libs/ValueRef.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';

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
        share: async (text: string, source?: string) => {
            TransactionConfirmModal.close();
            await delay(300);
            ComposeModalRef.open({
                chars: text.replaceAll(/mask\.io/gi, SITE_URL),
                source: source as SocialSource,
            });
        },
        connectPersona: createRejectCallback('connectPersona'),
        getPostIdFromNewPostToast: undefined,
        getSearchedKeyword: undefined,
        getUserIdentity: undefined,
        postMessage: undefined,
        publishPost: undefined,
        requestLogin: (source: SocialSource) => {
            LoginModalRef.open({ source });
        },
        ...context,
    };
}
