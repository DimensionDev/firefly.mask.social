'use client';
import { debounce } from 'lodash-es';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import RightArrowIcon from '@/assets/right-arrow.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { SourceTab } from '@/components/SourceTabs/SourceTab.js';
import { IS_APPLE, IS_SAFARI } from '@/constants/bowser.js';
import type { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

interface SourceTabsProps<S extends Source> {
    sources: S[];
    source: Source;
    urlMap: Record<Source, string>;
}

export function SourceTabs<S extends Source>({ sources, source, urlMap }: SourceTabsProps<S>) {
    const [overflowed, setOverflowed] = useState(false);
    const navRef = useRef<HTMLElement>(null);
    const [leftActive, setLeftActive] = useState(false);
    const [rightActive, setRightActive] = useState(false);

    const updateButtons = useCallback(() => {
        const nav = navRef.current;
        if (!nav) return;
        const threshold = 5;
        setOverflowed(nav.scrollWidth > nav.offsetWidth);

        setLeftActive(nav.scrollLeft > threshold);
        setRightActive(Math.abs(nav.scrollWidth - nav.scrollLeft - nav.offsetWidth) < threshold);
    }, []);

    const onScroll = useMemo(() => debounce(updateButtons, 100), [updateButtons]);

    useLayoutEffect(() => {
        updateButtons();
        const control = new AbortController();
        window.addEventListener('resize', updateButtons, { signal: control.signal });
        return () => control.abort();
    }, [updateButtons]);

    return (
        <div
            className={classNames(
                'no-scrollbar sticky top-[54px] z-40 flex w-full items-center overflow-x-auto overflow-y-hidden border-b border-line bg-primaryBottom md:top-0',
                {
                    'top-[53px]': IS_APPLE && IS_SAFARI,
                },
                overflowed ? 'gap-1 px-2' : 'px-4',
            )}
        >
            {overflowed ? (
                <ClickableButton
                    className={classNames('h-6 w-6 rotate-180', leftActive ? '' : 'opacity-50')}
                    disabled={!leftActive}
                    onClick={() => {
                        navRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
                    }}
                >
                    <RightArrowIcon width={24} height={24} />
                </ClickableButton>
            ) : null}
            <nav
                className="no-scrollbar flex min-w-0 flex-grow space-x-4 overflow-x-auto text-xl"
                aria-label="Tabs"
                ref={navRef}
                onScroll={onScroll}
            >
                {sources.map((x) => (
                    <SourceTab key={x} href={urlMap[x]} isActive={x === source}>
                        {resolveSourceName(x)}
                    </SourceTab>
                ))}
            </nav>
            {overflowed ? (
                <ClickableButton
                    className={classNames('h-6 w-6', rightActive ? 'opacity-50' : '')}
                    disabled={rightActive}
                    onClick={() => {
                        const nav = navRef.current;
                        if (!nav) return;
                        nav.scrollTo({ left: nav.scrollWidth - nav.offsetWidth, behavior: 'smooth' });
                    }}
                >
                    <RightArrowIcon width={24} height={24} />
                </ClickableButton>
            ) : null}
        </div>
    );
}
