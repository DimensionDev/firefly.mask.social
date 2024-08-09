import type { SendTransactionParameters } from 'viem';

import type { Frame, FrameButton } from '@/types/frame.js';

export async function getFrameMintTransaction(
    frame: Frame,
    button: FrameButton,
): Promise<SendTransactionParameters | null> {
    // not implemented
    return null;
}
