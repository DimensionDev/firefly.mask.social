import {
    LIMO_REGEXP,
    MIRROR_ARTICLE_REGEXP,
    MIRROR_SUBDOMAIN_ARTICLE_REGEXP,
    PARAGRAPH_ARTICLE_REGEXP,
} from '@/constants/regexp.js';
import { Md5 } from '@/helpers/md5.js';
import { FireflyArticleProvider } from '@/providers/firefly/Article.js';

export async function getArticleIdFromUrl(url: string) {
    if (LIMO_REGEXP.test(url)) {
        return Md5.hashStr(url);
    }
    if (MIRROR_ARTICLE_REGEXP.test(url)) {
        return url.match(MIRROR_ARTICLE_REGEXP)?.[1];
    }

    if (MIRROR_SUBDOMAIN_ARTICLE_REGEXP.test(url)) {
        return url.match(MIRROR_SUBDOMAIN_ARTICLE_REGEXP)?.[1];
    }

    if (PARAGRAPH_ARTICLE_REGEXP.test(url)) {
        return await FireflyArticleProvider.getParagraphArticleIdWithLink(url.replace('/view/', '/'));
    }
    return;
}
