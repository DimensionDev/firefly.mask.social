import { EMPTY_LIST } from '@/constants/index.js';

/**
 * Query meta tag with name or property s
 * @param s
 * @returns
 */
export const q = (document: Document, s: string) => {
    return document.querySelector(`meta[name="${s}"],meta[property="${s}"]`);
};

export const qAny = (document: Document, names: string[]) => {
    const selector = names.map((name) => `meta[name="${name}"],meta[property="${name}"]`).join(',');
    return document.querySelector(selector);
};

/**
 * Query meta tags with name or property s
 * @param s
 * @returns
 */
export const qAll = (document: Document, s: string) => {
    const firstTry = document.querySelectorAll(`meta[name="${s}"]`);
    if (firstTry.length > 0) return firstTry;
    const secondTry = document.querySelectorAll(`meta[property="${s}"]`);
    if (secondTry.length > 0) return secondTry;
    return EMPTY_LIST;
};

/**
 * Query meta tag with name or property starting with s
 * @param s
 * @returns
 */
export const qs = (document: Document, s: string) => {
    return document.querySelector(`meta[name^="${s}"]`) || document.querySelector(`meta[property^="${s}"]`);
};

/**
 * Query meta tags with name or property starting with s
 * @param s
 * @returns
 */
export const qsAll = (document: Document, s: string) => {
    return document.querySelectorAll(`[name^="${s}"],[property^="${s}"]`) || [];
};
