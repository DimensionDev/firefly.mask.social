'use client';

import { usePathname, useRouter } from 'next/navigation.js';
import { memo, useLayoutEffect, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import LeftArrowIcon from '@/assets/left-arrow.svg';
import SearchIcon from '@/assets/search.svg';
import { SearchInput } from '@/components/Search/SearchInput.js';
import { SearchRecommendation } from '@/components/Search/SearchRecommendation.js';
import { classNames } from '@/helpers/classNames.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useSearchHistoryStateStore } from '@/store/useSearchHistoryStore.js';
import { type SearchState, useSearchStateStore } from '@/store/useSearchStore.js';

interface SearchBarProps {
    source: 'header' | 'secondary';
}

const SearchBar = memo(function SearchBar(props: SearchBarProps) {
    const router = useRouter();
    const [showRecommendation, setShowRecommendation] = useState(false);

    const { searchKeyword, updateState } = useSearchStateStore();
    const { addRecord } = useSearchHistoryStateStore();

    const pathname = usePathname();
    const isSearchPage = isRoutePathname(pathname, '/search');

    const rootRef = useRef(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputText, setInputText] = useState(searchKeyword);

    useOnClickOutside(rootRef, () => {
        setShowRecommendation(false);
    });

    const handleInputSubmit = (state: SearchState) => {
        if (state.q) addRecord(state.q);
        updateState(state);
        setShowRecommendation(false);
    };

    useLayoutEffect(() => {
        setInputText(searchKeyword);
    }, [searchKeyword]);

    if (props.source === 'header' && !isSearchPage) return null;
    if (props.source === 'secondary' && isSearchPage) return null;

    return (
        <div
            className={classNames('hidden items-center px-4 pt-6 md:flex', {
                'pl-0 pr-0': props.source === 'secondary',
                'mb-4': props.source === 'secondary',
            })}
            ref={rootRef}
        >
            {isSearchPage && props.source === 'header' ? (
                <LeftArrowIcon width={24} height={24} className="mr-7 cursor-pointer" onClick={() => router.back()} />
            ) : null}
            <div className="relative flex flex-grow items-center rounded-xl bg-lightBg px-3 text-main">
                <SearchIcon width={18} height={18} className="shrink-0 text-primaryMain" />
                <form
                    className="w-full flex-1"
                    onSubmit={(ev) => {
                        ev.preventDefault();
                        handleInputSubmit({ q: inputText });
                    }}
                >
                    <SearchInput
                        value={inputText}
                        onChange={(ev) => setInputText(ev.target.value)}
                        onFocus={() => setShowRecommendation(true)}
                        onClear={() => setInputText('')}
                    />
                </form>
                {showRecommendation && !isSearchPage ? (
                    <SearchRecommendation
                        keyword={inputText}
                        onSearch={() => setShowRecommendation(false)}
                        onSelect={() => setShowRecommendation(false)}
                        onClear={() => inputRef.current?.focus()}
                    />
                ) : null}
            </div>
        </div>
    );
});

export function HeaderSearchBar() {
    const pathname = usePathname();
    const isSearchPage = isRoutePathname(pathname, '/search');
    return isSearchPage ? <SearchBar source="header" /> : null;
}

export function AsideSearchBar() {
    const pathname = usePathname();
    const isSearchPage = !isRoutePathname(pathname, '/search');
    return isSearchPage ? <SearchBar source="secondary" /> : null;
}
