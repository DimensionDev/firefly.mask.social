import type { FunctionComponent, SVGAttributes } from 'react';
import React from 'react';

import { Link } from '@/components/Link.js';
import { Tooltip } from '@/components/Tooltip.js';

interface PoapTraitProps {
    value?: string;
    url?: URL;
    icon: FunctionComponent<SVGAttributes<SVGElement>>;
    noWrap?: boolean;
}

export function PoapTrait({ value, url, icon, noWrap = false }: PoapTraitProps) {
    if (!value && !url) return null;

    const ValueIcon = icon;
    const content = (
        <>
            <ValueIcon className="-mt-px mr-1 inline-block" width={15} height={15} />
            <span>{url?.hostname || value}</span>
        </>
    );

    const Wrapper = noWrap ? React.Fragment : 'li';

    return (
        <Wrapper>
            {url ? (
                <Tooltip placement="top" content={url.href}>
                    <Link target="_blank" href={url}>
                        {content}
                    </Link>
                </Tooltip>
            ) : (
                content
            )}
        </Wrapper>
    );
}
