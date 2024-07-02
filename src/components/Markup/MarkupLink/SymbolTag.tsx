'use client';

import { memo, useState } from 'react';

import type { MarkupLinkProps } from '@/components/Markup/MarkupLink/index.js';
import { TokenProfile } from '@/components/TokenProfile/TokenProfile.js';
import { Link } from '@/esm/Link.js';
import { Tippy } from '@/esm/Tippy.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

export const SymbolTag = memo<Omit<MarkupLinkProps, 'post'>>(function SymbolTag({ title }) {
    const [show, setShow] = useState(false);
    const isMedium = useIsMedium();

    if (!title) return null;
    const symbol = title.slice(1);
    const enabled = isMedium && show;

    const content = (
        <Link className="cursor-pointer text-link hover:underline" href={`/token/${symbol}`}>
            {title}
        </Link>
    );

    if (isMedium) {
        return (
            <Tippy
                appendTo={() => document.body}
                maxWidth={350}
                className="tippy-card"
                placement="bottom"
                duration={500}
                delay={500}
                arrow={false}
                trigger="mouseenter"
                onShow={() => setShow(true)}
                hideOnClick
                interactive
                content={
                    enabled ? (
                        <TokenProfile
                            className="bg-primaryBottom p-2 text-main shadow-[0_8px_20px_0_rgba(0,0,0,0.04)]"
                            symbol={symbol}
                        />
                    ) : null
                }
            >
                {content}
            </Tippy>
        );
    }
    return content;
});
