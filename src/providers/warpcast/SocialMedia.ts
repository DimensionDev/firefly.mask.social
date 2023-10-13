import { ResponseJSON } from '@/types';
import { fetchJSON } from '@/helpers/fetchJSON';
import { waitForSignedKeyRequestComplete } from '@/helpers/waitForSignedKeyRequestComplete';
import { Provider, Type } from '@/providers/types/SocialMedia';
import { WarpcastSession } from '@/providers/warpcast/Session';

export class WarpcastSocialMedia implements Provider {
    get type() {
        return Type.Warpcast;
    }

    async createSession() {
        const response = await fetchJSON<
            ResponseJSON<{
                publicKey: string;
                privateKey: string;
                fid: string;
                token: string;
                timestamp: number;
                expiresAt: number;
                deeplinkUrl: string;
            }>
        >('/api/warpcast/signin', {
            method: 'POST',
        });
        if (!response.success) throw new Error(response.error.message);

        // show the QR code
        console.log('DEBUG: response');
        console.log(response);

        const controller = new AbortController();

        await waitForSignedKeyRequestComplete(controller.signal)(response.data.token);

        return new WarpcastSession(response.data.privateKey, response.data.timestamp, response.data.expiresAt);
    }
}
