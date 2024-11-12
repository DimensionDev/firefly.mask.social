import { FrameProtocol } from '@/constants/enum.js';
import { q, qsAll } from '@/helpers/q.js';

export function getFrameClientProtocol(document: Document, strict = false) {
    const ofVersion = q(document, 'of:version')?.getAttribute('content');
    if (ofVersion) {
        if (!strict) {
            const ofButtons = qsAll(document, 'of:button:');
            const fcButtons = qsAll(document, 'fc:frame:button:');
            if (!ofButtons.length && fcButtons.length) return FrameProtocol.Farcaster; // farcaster
        }

        return FrameProtocol.OpenFrame; // open frame
    }

    const fcVersion = q(document, 'fc:frame')?.getAttribute('content');
    if (fcVersion) return FrameProtocol.Farcaster; // farcaster

    return;
}
