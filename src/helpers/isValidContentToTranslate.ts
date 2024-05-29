import { isNaN } from 'lodash-es';

import { trimify } from '@/helpers/trimify.js';

export const isValidContentToTranslate = (content: string) => {
    if (!trimify(content) || !isNaN(+content)) return false;
    return true;
};
