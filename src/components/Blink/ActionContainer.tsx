import { Action, ActionContainer as RawActionContainer } from '@dialectlabs/blinks';
import { memo } from 'react';

import { parseUrl } from '@/helpers/parseUrl.js';

export const ActionContainer = memo<{
    action: Action;
}>(function ActionContainer({ action }) {
    const parsed = parseUrl(action.url);

    return (
        <div
            className="mt-3"
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <RawActionContainer action={action} websiteUrl={parsed?.origin} websiteText={parsed?.host} />
        </div>
    );
});
