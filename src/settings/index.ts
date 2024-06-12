import { FIREFLY_DEV_ROOT_URL, FIREFLY_ROOT_URL } from '@/constants/index.js';
import { useDeveloperSettings } from '@/store/useDeveloperSettings.js';

class Settings {
    get FIREFLY_ROOT_URL() {
        return useDeveloperSettings.getState().useDevelopmentAPI ? FIREFLY_DEV_ROOT_URL : FIREFLY_ROOT_URL;
    }
}

export const settings = new Settings();
