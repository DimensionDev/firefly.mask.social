import { FIREFLY_DEV_ROOT_URL, FIREFLY_ROOT_URL } from '@/constants/index.js';
import { useDeveloperSettingsState } from '@/store/useDeveloperSettingsStore.js';

class Settings {
    get FIREFLY_ROOT_URL() {
        return useDeveloperSettingsState.getState().useDevelopmentAPI ? FIREFLY_DEV_ROOT_URL : FIREFLY_ROOT_URL;
    }
}

export const settings = new Settings();
