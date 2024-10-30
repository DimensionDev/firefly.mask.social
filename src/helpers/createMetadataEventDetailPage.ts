import urlcat from 'urlcat';

import { SITE_URL } from '@/constants/index.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';

export async function createMetadataEventDetailPage(eventName: string) {
    const info = await FireflyActivityProvider.getFireflyActivityInfo(eventName).catch(() => undefined);
    if (!info) return createSiteMetadata();
    const title = info.title;
    const description = info.sub_title;
    const images = [info.open_graph_url];
    return createSiteMetadata({
        title,
        description,
        openGraph: {
            type: 'website',
            url: urlcat(SITE_URL, `event/:name`, {
                name: eventName,
            }),
            title,
            description,
            images,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images,
        },
    });
}
