import { compact, last, uniqBy } from 'lodash-es';

import { EMAIL_REGEX, URL_REGEX } from '@/constants/regexp.js';
import { fixUrlProtocol } from '@/helpers/fixUrlProtocol.js';

const fixUrls = (urls: Array<string | undefined>) => {
    return uniqBy(compact(urls), (x) => x).map(fixUrlProtocol);
};

const emailRegExp = new RegExp(EMAIL_REGEX, 'g');

export function getEmbedUrls(content: string, embedUrls: string[]) {
    const matchedUrls = fixUrls([...content.replaceAll(emailRegExp, '').matchAll(URL_REGEX)].map((x) => x[0]));
    const oembedUrls = fixUrls([...matchedUrls, ...embedUrls]);
    const oembedUrl = last(oembedUrls);
    return {
        matchedUrls,
        oembedUrls,
        oembedUrl,
    };
}
