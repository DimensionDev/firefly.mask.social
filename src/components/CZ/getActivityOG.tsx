import { SITE_URL } from '@/constants/index.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

export function getActivityOG() {
    const title = 'Welcome Back CZ Collectible';
    const description = 'Get a free special edition Firefly NFT to celebrate CZ’s return!';
    const images = [`${SITE_URL}/image/activity/cz/preview.png`];
    return createSiteMetadata({
        title,
        description,
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            creator: '@thefireflyapp',
            images,
        },
        openGraph: {
            title,
            description,
            url: SITE_URL,
            images,
        },
    });
}
