import { bom } from '@/helpers/bom.js';
import { parseURL } from '@/helpers/parseURL.js';

/**
 * Determines whether the provided link matches the specified host.
 * @param {string} link - The URL to be checked.
 * @param {string} host - The host to compare against.
 * @param {boolean} strict - If true, performs a strict host match; otherwise, checks for a partial match.
 * @returns {boolean} - True if the link matches the host criteria; otherwise, false.
 */
export function isLinkMatchingHost(link: string, host: string, strict = true) {
    const parsedURL = parseURL(link);
    if (!parsedURL) return false;
    if (!['https:', 'http:'].includes(parsedURL.protocol)) return false;
    return strict ? parsedURL.host === host : parsedURL.host.endsWith(host);
}

/**
 * Checks if the given link is a self-reference based on the current location's host.
 * @param {string} link - The URL to be checked.
 * @returns {boolean} - True if the link is a self-reference; otherwise, false.
 */
export function isSelfReference(link: string) {
    return bom.location ? isLinkMatchingHost(link, location.host) : false;
}
