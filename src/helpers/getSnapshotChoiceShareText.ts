import { compact, isArray, isNumber, isObject } from 'lodash-es';

import type { SnapshotChoice } from '@/providers/snapshot/type.js';

export function getSnapshotChoiceShareText(selectedChoices: SnapshotChoice, choices: string[], type: string) {
    if ((type === 'single-choice' || type === 'basic') && isNumber(selectedChoices)) {
        return choices[selectedChoices - 1];
    } else if (type === 'approval' && isArray(selectedChoices)) {
        return compact(
            choices.map((value, index) => {
                if (selectedChoices.includes(index + 1)) return value;
                return;
            }),
        ).join(', ');
    } else if (
        (type === 'quadratic' || type === 'weighted') &&
        isObject(selectedChoices) &&
        !isArray(selectedChoices)
    ) {
        return compact(
            choices.map((value, index) => {
                if (selectedChoices[index + 1]) return value;
                return;
            }),
        ).join(', ');
    } else if (type === 'ranked-choice' && isArray(selectedChoices)) {
        return selectedChoices
            .map((index) => {
                return choices[index - 1];
            })
            .join(', ');
    }

    return;
}
