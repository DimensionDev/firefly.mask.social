import type { Address, Hex } from 'viem';

import type { FrameButton, FrameV1 } from '@/types/frame.js';

export async function getFrameMintTransaction(
    frame: FrameV1,
    button: FrameButton,
): Promise<{
    to: Address;
    data: Hex;
    value: bigint;
} | null> {
    // not implemented
    return null;
}
