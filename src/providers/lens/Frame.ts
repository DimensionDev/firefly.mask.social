import { type FrameLensManagerEip712Request } from '@lens-protocol/client';
import { ZERO_ADDRESS } from '@masknet/web3-shared-evm';

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

        const plainData: FrameLensManagerEip712Request = {
            actionResponse: ZERO_ADDRESS,
            buttonIndex: index,
            inputText: input ?? '',
            profileId,
            pubId: postId,
            // The EIP-721 spec version, must be 1.0.0
            specVersion: '1.0.0',
            state: additional?.state ?? '',
            url: frame.url,
        };

        const result = await lensSessionHolder.sdk.frames.signFrameAction({
            ...plainData,
        });

        if (result.isFailure()) {
            // CredentialsExpiredError or NotAuthenticatedError
            throw result.error;
        }

        const deadline = new Date();
        // 30 minutes
        deadline.setMinutes(deadline.getMinutes() + 30);
        const packet = {
            clientProtocol: 'lens@1.0.0',
            untrustedData: {
                ...plainData,
                deadline: deadline.getTime(),
                identityToken: identityTokenResult.unwrap(),
            },
            trustedData: {
                messageBytes: result.value.signature,
            },
        };

        return packet;
    }
}

export const LensFrameProvider = new FrameProvider();
