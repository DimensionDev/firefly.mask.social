import { headers } from 'next/headers.js';

/**
 * Detect if the request is from a bot.
 * @returns
 */
export async function isBotRequest() {
    const headers_ = await headers();
    const ua = headers_.get('user-agent');

    /* cspell:disable-next-line */
    return headers_.get('X-IS-BOT') === 'true' || (ua && /TelegramBot|Rocket\.Chat|Googlebot/i.test(ua));
}
