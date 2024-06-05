import { type FrameLensManagerEip712Request } from '@lens-protocol/client';

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
