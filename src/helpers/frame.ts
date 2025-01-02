import type { Frame, FrameV1, FrameV2 } from '@/types/frame.js';

export function isFrameV1(frame: Frame): frame is FrameV1 {
    return frame.x_version === 1;
}

export function isFrameV2(frame: Frame): frame is FrameV2 {
    return frame.x_version === 2;
}
