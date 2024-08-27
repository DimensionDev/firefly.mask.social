import { Action, ActionContainer as RawActionContainer } from '@dialectlabs/blinks';
import { memo, useEffect, useRef } from 'react';

import { parseURL } from '@/helpers/parseURL.js';

export const ActionContainer = memo<{
    action: Action;
    url: string;
}>(function ActionContainer({ action, url }) {
    const urlObj = parseURL(url);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const img = ref.current?.querySelector<HTMLImageElement>('img[alt="action-image"]');
        if (!img) return;
        const srcObj = parseURL(img.getAttribute('src') ?? '');
        if (!srcObj) return;
        const originUrl = srcObj.searchParams.get('url');
        if (srcObj.host === location.host && srcObj.pathname === '/api/blink/image' && originUrl) {
            img.onerror = () => {
                img.setAttribute('src', originUrl);
            };
        }
    }, [action.icon]);

    return (
        <div
            className="mt-3"
            ref={ref}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <RawActionContainer action={action} websiteUrl={urlObj?.origin} websiteText={urlObj?.host} />
        </div>
    );
});
