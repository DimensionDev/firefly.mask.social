'use client';

import { useRouter } from 'next/navigation.js';
import { memo, useState } from 'react';

import { ClickableArea } from '@/components/ClickableArea.js';
import type { MarkupLinkProps } from '@/components/Markup/MarkupLink/index.js';
import { TokenProfile } from '@/components/TokenProfile/TokenProfile.js';
import { Tippy } from '@/esm/Tippy.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

export const SymbolTag = memo<Omit<MarkupLinkProps, 'post'>>(function SymbolTag({ title }) {
    const [show, setShow] = useState(false);
    const isMedium = useIsMedium();
    const router = useRouter();

    if (!title) return null;
    const symbol = title.slice(1);
    const enabled = isMedium && show;

    const content = (
        <ClickableArea
            className="cursor-pointer text-link"
            as="span"
            onMouseEnter={() => {
                if (symbol) router.prefetch(`/token/${symbol}`);
            }}
            onClick={() => {
                scrollTo(0, 0);
                router.push(`/token/${symbol}`);
            }}
        >
            {title}
        </ClickableArea>
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
                            symbol={title.slice(1)}
                        />
                    ) : null
                }
            >
                <span>{content}</span>
            </Tippy>
        );
    }
    return content;
});
