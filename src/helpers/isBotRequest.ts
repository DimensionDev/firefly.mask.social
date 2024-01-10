import { headers } from 'next/headers.js';

/**
 * Detect if the request is from a bot.
 * @returns
 */
export function isBotRequest() {
    const headers_ = headers();
    const ua = headers_.get('user-agent');
    return headers_.get('X-IS-BOT') === 'true' || ua?.match(/TelegramBot|Rocket\.Chat|Googlebot/i);
}
