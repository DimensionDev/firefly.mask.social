'use client';

import { memo, useState } from 'react';

import { InteractiveTippy } from '@/components/InteractiveTippy.js';
import { Link } from '@/components/Link.js';
import type { MarkupLinkProps } from '@/components/Markup/MarkupLink/index.js';
import { useTippyContext } from '@/components/TippyContext/index.js';
import { TokenProfile } from '@/components/TokenProfile/TokenProfile.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

export const SymbolTag = memo<Omit<MarkupLinkProps, 'post'>>(function SymbolTag({ title }) {
    const [show, setShow] = useState(false);
    const isMedium = useIsMedium();
    const insideTippy = useTippyContext();

    if (!title) return null;
    const symbol = title.slice(1);
    // $123 or $100M
    if (symbol.match(/^\d+$/) || /^\d+(k|m|b|t)$/i.test(symbol)) return title;
    const enabled = isMedium && show;

    const content = (
        <Link
            className="cursor-pointer text-highlight hover:underline"
            onClick={(e) => {
                e.stopPropagation();
            }}
            prefetch={false}
            href={`/token/${symbol}`}
        >
            {title}
        </Link>
    );

    if (isMedium && !insideTippy) {
        return (
            <InteractiveTippy
                maxWidth={350}
                className="tippy-card"
                placement="bottom"
                onShow={() => setShow(true)}
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
            </InteractiveTippy>
        );
    }
    return content;
});
