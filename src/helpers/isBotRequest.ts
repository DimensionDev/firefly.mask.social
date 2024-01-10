import { headers } from 'next/headers.js';

/**
 * Detect if the request is from a bot.
 * @returns
 */
export function isBotRequest() {
    return headers().get('X-IS-BOT') === 'true';
}
