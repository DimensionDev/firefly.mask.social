import urlcat from 'urlcat';

import { config } from '@/configs/wagmiClient.js';
import { createDummyProfileFromFireflyAccountId } from '@/helpers/createDummyProfile.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import type { MessageToSignResponse, WalletLoginResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

async function createSession(signal?: AbortSignal) {
    const client = await getWalletClientRequired(config);
    const address = client.account.address.toLowerCase();

    // request message to sign
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet/messageToSign', {
        address,
    });
    const response = await fetchJSON<MessageToSignResponse>(url, {
        method: 'GET',
        signal,
    });
    const { message } = resolveFireflyResponseData(response);

    // sign message and login
    const loginUrl = urlcat(settings.FIREFLY_ROOT_URL, '/v3/auth/wallet/login');
    const signature = await client.signMessage({ message });
    const loginResponse = await fetchJSON<WalletLoginResponse>(loginUrl, {
        method: 'POST',
        body: JSON.stringify({
            address,
            signature,
            signedMessage: message,
        }),
    });

    // compose session
    const { accessToken, accountId } = resolveFireflyResponseData(loginResponse);
    return new FireflySession(accountId, accessToken, null, {
        address,
        message,
        signature,
    });
}

export async function createAccountBySignMessage(signal?: AbortSignal) {
    const session = await createSession(signal);
    return {
        session,
        profile: createDummyProfileFromFireflyAccountId(session.profileId),
    };
}
