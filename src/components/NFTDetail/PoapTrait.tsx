import type { FunctionComponent, SVGAttributes } from 'react';

import { Tooltip } from '@/components/Tooltip.js';
import { Link } from '@/esm/Link.js';

interface PoapTraitProps {
    value?: string;
    url?: URL;
    icon: FunctionComponent<SVGAttributes<SVGElement>>;
}

export function PoapTrait({ value, url, icon }: PoapTraitProps) {
    if (!value && !url) return null;

    const ValueIcon = icon;
    const content = (
        <>
            <ValueIcon className="-mt-px mr-1 inline-block" width={15} height={15} />
            <span>{url?.hostname || value}</span>
        </>
    );
    return (
        <li>
            {url ? (
                <Tooltip placement="top" content={url.href}>
                    <Link target="_blank" href={url}>
                        {content}
                    </Link>
                </Tooltip>
            ) : (
                content
            )}
        </li>
    );
}
