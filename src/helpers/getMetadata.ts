import type { Document } from 'linkedom';

export const getTitle = (document: Document): string | null => {
    const lens =
        document.querySelector('meta[name="lens:title"]') || document.querySelector('meta[property="lens:title"]');
    const og = document.querySelector('meta[name="og:title"]') || document.querySelector('meta[property="og:title"]');
    const twitter =
        document.querySelector('meta[name="twitter:title"]') ||
        document.querySelector('meta[property="twitter:title"]');

    if (lens) {
        return lens.getAttribute('content');
    } else if (og) {
        return og.getAttribute('content');
    } else if (twitter) {
        return twitter.getAttribute('content');
    }

    return null;
};

export const getDescription = (document: Document): string | null => {
    const lens =
        document.querySelector('meta[name="lens:description"]') ||
        document.querySelector('meta[property="lens:description"]');
    const og =
        document.querySelector('meta[name="og:description"]') ||
        document.querySelector('meta[property="og:description"]');
    const twitter =
        document.querySelector('meta[name="twitter:description"]') ||
        document.querySelector('meta[property="twitter:description"]');

    if (lens) {
        return lens.getAttribute('content');
    } else if (og) {
        return og.getAttribute('content');
    } else if (twitter) {
        return twitter.getAttribute('content');
    }

    return null;
};

export const getSite = (document: Document): string | null => {
    const lens =
        document.querySelector('meta[name="lens:site"]') || document.querySelector('meta[property="lens:site"]');
    const og =
        document.querySelector('meta[name="og:site_name"]') || document.querySelector('meta[property="og:site_name"]');
    const twitter =
        document.querySelector('meta[name="twitter:site"]') || document.querySelector('meta[property="twitter:site"]');

    if (lens) {
        return lens.getAttribute('content');
    } else if (og) {
        return og.getAttribute('content');
    } else if (twitter) {
        return twitter.getAttribute('content');
    }

    return null;
};

export const getImage = (document: Document): string | null => {
    const lens =
        document.querySelector('meta[name="lens:image"]') || document.querySelector('meta[property="lens:image"]');
    const og = document.querySelector('meta[name="og:image"]') || document.querySelector('meta[property="og:image"]');
    const twitter =
        document.querySelector('meta[name="twitter:image"]') ||
        document.querySelector('meta[name="twitter:image:src"]') ||
        document.querySelector('meta[property="twitter:image"]') ||
        document.querySelector('meta[property="twitter:image:src"]');

    if (lens) {
        return lens.getAttribute('content');
    } else if (og) {
        return og.getAttribute('content');
    } else if (twitter) {
        return twitter.getAttribute('content');
    }

    return null;
};
