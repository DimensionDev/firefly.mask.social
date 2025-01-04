import { isServer } from '@tanstack/react-query';
import { cookies } from 'next/headers.js';

import { FIREFLY_DEV_ROOT_URL, FIREFLY_ROOT_URL, FRAME_DEV_SERVER_URL, FRAME_SERVER_URL } from '@/constants/index.js';
import { useDeveloperSettingsState } from '@/store/useDeveloperSettingsStore.js';
import { getDOMCookie } from '@/helpers/getCookie.js';

// this value will be set on server.
let IS_DEV = isServer ? false : useDeveloperSettingsState.getState().developmentAPI;
function is_dev() {
    if (isServer) return IS_DEV;
    return getDOMCookie('firefly_root_api') === FIREFLY_DEV_ROOT_URL;
}
export async function prepareSettingsForSSR() {
    if (!isServer) throw new Error('This function should only be called on server');
    IS_DEV = (await cookies()).get('firefly_root_api')?.value === FIREFLY_DEV_ROOT_URL;
}
export const settings = {
    get FIREFLY_ROOT_URL() {
        return is_dev() ? FIREFLY_DEV_ROOT_URL : FIREFLY_ROOT_URL;
    },
    get FRAME_SERVER_URL() {
        return is_dev() ? FRAME_DEV_SERVER_URL : FRAME_SERVER_URL;
    },
};
