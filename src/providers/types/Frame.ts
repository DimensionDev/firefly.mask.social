import type { Index } from '@/types/frame.js';

export interface Additional {
    // for initial frame should not provide state
    state?: string;
    address?: string;
    transactionId?: string;
}

export interface Provider<Signature> {
    generateSignaturePacket(
        postId: string,
        frameUrl: string,
        index: Index,
        input?: string,
        additional?: Additional,
    ): Promise<Signature>;
}
