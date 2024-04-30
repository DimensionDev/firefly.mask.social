import type { SocialPlatform } from '@/constants/enum.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

export function getDetailedErrorMessage(source: SocialPlatform, error: unknown) {
    if (!(error instanceof Error)) return '';
    const lines = [`${resolveSourceName(source)}: ${error.message}`];
    if (error.stack) lines.push(error.stack);
    lines.push('');
    return lines.join('\n');
}
