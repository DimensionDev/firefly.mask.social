import type { Frame, Index } from '@/types/frame.js';

export interface Additional {
    // for initial frame should not provide state
    state?: string;
    address?: string;
    transactionId?: string;
}

export interface Provider<Signature> {
    generateSignaturePacket(
        postId: string,
        frame: Frame,
        index: Index,
        input?: string,
        additional?: Additional,
    ): Promise<Signature>;
}
