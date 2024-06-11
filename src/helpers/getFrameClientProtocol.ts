import { q } from '@/helpers/q.js';

export function getFrameClientProtocol(document: Document) {
    const ofVersion = q(document, 'of:version')?.getAttribute('content');
    if (ofVersion) return 'of'; // open frame

    const fcVersion = q(document, 'fc:frame')?.getAttribute('content');
    if (fcVersion) return 'fc'; // farcaster

    return;
}
