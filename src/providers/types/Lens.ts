import { type FrameLensManagerEip712Request } from '@lens-protocol/client/gated';

export interface FrameSignaturePacket {
    clientProtocol: string;
    untrustedData: FrameLensManagerEip712Request & {
        deadline: number;
        identityToken: string;
    };
    trustedData: {
        messageBytes: string;
    };
}

export enum LensMetadataAttributeKey {
    Poll = 'pollId',
}
