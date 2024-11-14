import { Action, Blink } from '@dialectlabs/blinks';
import { memo } from 'react';

import { parseUrl } from '@/helpers/parseUrl.js';
import { useActionAdapter } from '@/hooks/useActionAdapter.js';

export const ActionContainer = memo<{
    action: Action;
    url: string;
}>(function ActionContainer({ action, url }) {
    const parsed = parseUrl(action.url);
    const adapter = useActionAdapter(url);

    return (
        <div
            className="mt-3"
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <Blink action={action} adapter={adapter} websiteUrl={parsed?.origin} websiteText={parsed?.host} />
        </div>
    );
});
