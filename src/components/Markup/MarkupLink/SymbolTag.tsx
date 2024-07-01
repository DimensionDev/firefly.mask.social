'use client';

import { useRouter } from 'next/navigation.js';
import { memo, useState } from 'react';
import urlcat from 'urlcat';

import { ClickableArea } from '@/components/ClickableArea.js';
import type { MarkupLinkProps } from '@/components/Markup/MarkupLink/index.js';
import { TokenProfile } from '@/components/TokenProfile/TokenProfile.js';
import { PageRoute, SearchType } from '@/constants/enum.js';
import { Tippy } from '@/esm/Tippy.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { getTokenInfo } from '@/hooks/useTokenInfo.js';

export const SymbolTag = memo<Omit<MarkupLinkProps, 'post'>>(function SymbolTag({ title, source }) {
    const [show, setShow] = useState(false);
    const isMedium = useIsMedium();
    const router = useRouter();

    if (!title) return null;
    const symbol = title.slice(1);
    const enabled = isMedium && show;

    const content = (
        <ClickableArea
            className="cursor-pointer text-link hover:underline"
            as="span"
            onMouseEnter={() => {
                if (symbol) router.prefetch(`/token/${symbol}`);
            }}
            onClick={async (event) => {
                event.preventDefault();
                event.stopPropagation();
                const token = await getTokenInfo(symbol);
                if (token) router.push(`/token/${symbol}`);
                else
                    router.push(
                        urlcat(PageRoute.Search, {
                            q: title,
                            type: SearchType.Posts,
                            source: source ? resolveSourceInURL(source) : undefined,
                        }),
                    );
                scrollTo(0, 0);
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
                            symbol={symbol}
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
