import { Action, ActionContainer as RawActionContainer } from '@dialectlabs/blinks';
import { memo } from 'react';

import { parseURL } from '@/helpers/parseURL.js';

export const ActionContainer = memo<{
    action: Action;
}>(function ActionContainer({ action }) {
    const urlObj = parseURL(action.url);

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
