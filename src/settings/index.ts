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
        return useDeveloperSettingsState.getState().useDevelopmentAPI ? FIREFLY_DEV_ROOT_URL : FIREFLY_ROOT_URL;
    }

    get FRAME_SERVER_URL() {
        return useDeveloperSettingsState.getState().useDevelopmentAPI ? FRAME_DEV_SERVER_URL : FRAME_SERVER_URL;
    }

    get ADVERTISEMENT_JSON_URL() {
        return useDeveloperSettingsState.getState().useDevelopmentAPI
            ? ADVERTISEMENT_JSON_URL_DEV
            : ADVERTISEMENT_JSON_URL;
    }
}

export const settings = new Settings();
