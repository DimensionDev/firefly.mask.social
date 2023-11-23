import { v4 as uuid } from 'uuid';

import getUserLocale from '@/helpers/getUserLocale.js';

interface IBaseMetadata {
    title: string;
    content: string;
    marketplace: {
        name: string;
        description: string;
    };
}

export default function getPostMetaData(baseMetadata: IBaseMetadata) {
    const localBaseMetadata = {
        id: uuid(),
        locale: getUserLocale(),
        appId: 'mask',
    };

    return {
        ...baseMetadata,
        ...localBaseMetadata,
    };
}
