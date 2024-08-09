import type { SendTransactionParameters } from 'viem';

import { NotImplementedError } from '@/constants/error.js';
import type { Frame, FrameButton } from '@/types/frame.js';

export async function getFrameMintTransaction(
    frame: Frame,
    button: FrameButton,
): Promise<SendTransactionParameters | null> {
    throw new NotImplementedError();
}
