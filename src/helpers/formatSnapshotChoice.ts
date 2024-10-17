import { sum, values } from 'lodash-es';

import { ordinal_suffix_of } from '@/helpers/ordinal_suffix_of.js';
import type { SnapshotChoice } from '@/providers/snapshot/type.js';

export function formatSnapshotChoice(choice: SnapshotChoice, type: string, choices: string[]) {
    if (['single-choice', 'basic'].includes(type) && typeof choice === 'number') {
        const target = choices[choice - 1];
        return target;
    } else if (type === 'approval' && Array.isArray(choice)) {
        return choice.map((c) => `Option ${choices[c - 1]}`).join(', ');
    } else if (type === 'ranked-choice' && Array.isArray(choice)) {
        return choice.map((c, index) => `(${ordinal_suffix_of(index + 1)}) ${choices[c - 1]}`).join(', ');
    } else if (['quadratic', 'weighted'].includes(type) && typeof choice === 'object') {
        const total = sum(values(choice));
        return Object.entries(choice)
            .map(([key, value]) => {
                const percentage = total ? (value / total) * 100 : 0;
                const label = choices[parseInt(key) - 1];
                return `${Math.round(percentage)}% for ${label}`;
            })
            .join(', ');
    }

    return;
}
