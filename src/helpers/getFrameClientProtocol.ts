import { getMetaContent } from '@/helpers/getMetaContent.js';
import { qs } from '@/helpers/q.js';

export const getFrameClientProtocol = (document: Document) => {
    const openFrameProtocol = qs(document, 'of:accepts:');
    const openFrameVersion = getMetaContent(document, 'of:version');
    return openFrameProtocol && openFrameVersion ? 'of' : 'fc:frame';
};
