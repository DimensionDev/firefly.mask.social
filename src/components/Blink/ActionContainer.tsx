import { Action, ActionContainer as RawActionContainer } from '@dialectlabs/blinks';
import { memo } from 'react';

import { parseURL } from '@/helpers/parseURL.js';

export const ActionContainer = memo<{
    action: Action;
    url: string;
}>(function ActionContainer({ action, url }) {
    const urlObj = parseURL(url);

    return (
        <div
            className="mt-3"
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <RawActionContainer action={action} websiteUrl={urlObj?.origin} websiteText={urlObj?.host} />
        </div>
    );
});
