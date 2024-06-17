import dayjs from 'dayjs';

import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import type { Additional, Provider } from '@/providers/types/Frame.js';
import type { FrameSignaturePacket } from '@/providers/types/Lens.js';
import type { Frame, Index } from '@/types/frame.js';

class FrameProvider implements Provider<FrameSignaturePacket> {
    async generateSignaturePacket(
        postId: string,
        frame: Frame,
        index: Index,
        input?: string,
        additional?: Additional,
    ): Promise<FrameSignaturePacket> {
        const identityTokenResult = await lensSessionHolder.sdk.authentication.getIdentityToken();
        if (identityTokenResult.isFailure()) {
            throw identityTokenResult.error;
        }

        const profileId = await lensSessionHolder.sdk.authentication.getProfileId();
        if (!profileId) throw new Error('No profile found');

        const result = await lensSessionHolder.sdk.frames.signFrameAction({
            actionResponse: '',
            buttonIndex: index,
            inputText: input ?? '',
            profileId,
            pubId: postId,
            // The EIP-721 spec version, must be 1.0.0
            specVersion: '1.0.0',
            state: additional?.state ?? '',
            url: frame.url,
        });
        if (result.isFailure()) {
            // CredentialsExpiredError or NotAuthenticatedError
            throw result.error;
        }

        const packet = {
            clientProtocol: 'lens@1.0.0',
            untrustedData: {
                identityToken: identityTokenResult.unwrap(),
                unixTimestamp: dayjs(Date.now()).unix(),
                ...result.value.signedTypedData.value,
            },
            trustedData: {
                messageBytes: result.value.signature,
            },
        };

        return packet;
    }
}

export const LensFrameProvider = new FrameProvider();
