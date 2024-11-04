import { isServer } from '@tanstack/react-query';
import { cookies } from 'next/headers.js';

import {
    ADVERTISEMENT_JSON_URL,
    ADVERTISEMENT_JSON_URL_DEV,
    FIREFLY_DEV_ROOT_URL,
    FIREFLY_ROOT_URL,
    FRAME_DEV_SERVER_URL,
    FRAME_SERVER_URL,
} from '@/constants/index.js';
import { useDeveloperSettingsState } from '@/store/useDeveloperSettingsStore.js';

class Settings {
    get FIREFLY_ROOT_URL() {
        if (isServer) {
            const apiUrl = cookies().get('firefly_root_api')?.value ?? FIREFLY_ROOT_URL;
            return apiUrl;
        }
        return useDeveloperSettingsState.getState().developmentAPI ? FIREFLY_DEV_ROOT_URL : FIREFLY_ROOT_URL;
    }

    get FRAME_SERVER_URL() {
        return useDeveloperSettingsState.getState().developmentAPI ? FRAME_DEV_SERVER_URL : FRAME_SERVER_URL;
    }

    get ADVERTISEMENT_JSON_URL() {
        return useDeveloperSettingsState.getState().developmentAPI
            ? ADVERTISEMENT_JSON_URL_DEV
            : ADVERTISEMENT_JSON_URL;
    }
}

export const settings = new Settings();
