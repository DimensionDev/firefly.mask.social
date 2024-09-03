import { FrameProtocol } from '@/constants/enum.js';
import { q } from '@/helpers/q.js';

export function getFrameClientProtocol(document: Document) {
    const ofVersion = q(document, 'of:version')?.getAttribute('content');
    if (ofVersion) return FrameProtocol.OpenFrame; // open frame

    const fcVersion = q(document, 'fc:frame')?.getAttribute('content');
    if (fcVersion) return FrameProtocol.Farcaster; // farcaster

    return;
}
