import type { Address, Hex } from 'viem';

import type { Frame, FrameButton } from '@/types/frame.js';

export async function getFrameMintTransaction(
    frame: Frame,
    button: FrameButton,
): Promise<{
    to: Address;
    data: Hex;
    value: bigint;
} | null> {
    // not implemented
    return null;
}
