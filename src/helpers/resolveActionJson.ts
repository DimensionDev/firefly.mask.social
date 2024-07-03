import { parseURL } from '@/helpers/parseURL.js';
import type { ActionRuleResponse } from '@/providers/types/Blink.js';

export function resolveActionJson(url: string, actions: ActionRuleResponse) {
    const urlObj = parseURL(url);
    if (!urlObj) throw new Error('Invalid blink');
    const paths = urlObj.pathname.split('/');
    for (const rule of actions.rules) {
        const pathPatterns = rule.pathPattern.split('/');
        for (let i = 0; i < pathPatterns.length; i += 1) {
            const pathPattern = pathPatterns[i];
            if (pathPattern === '**') {
                pathPatterns[i] = paths.slice(i).join('/');
                continue;
            }
            if (pathPattern === '*') {
                pathPatterns[i] = paths[i];
                continue;
            }
            if (pathPattern !== paths[i]) break;
        }
        const newPath = pathPatterns.join('/');
        if (newPath !== rule.pathPattern) return rule.apiPath.replace(rule.pathPattern, pathPatterns.join('/'));
    }
    return null;
}
