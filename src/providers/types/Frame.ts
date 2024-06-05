import type { Frame, Index } from '@/types/frame.js';

export interface Additionals {
    // for initial frame should not provide state
    state?: string;
    transactionId?: string;
}

export interface Provider<Signature> {
    generateSignaturePacket(
        postId: string,
        frame: Frame,
        index: Index,
        input?: string,
        additionals?: Additionals,
    ): Promise<Signature>;
}
