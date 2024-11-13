'use client';

import { usePathname } from 'next/navigation.js';
import { type HTMLProps, memo, useLayoutEffect, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import LeftArrowIcon from '@/assets/left-arrow.svg';
import SearchIcon from '@/assets/search.svg';
import { SearchInput } from '@/components/Search/SearchInput.js';
import { SearchRecommendation } from '@/components/Search/SearchRecommendation.js';
import { Section } from '@/components/Semantic/Section.js';
import { PageRoute } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useComeBack } from '@/hooks/useComeback.js';
import { useSearchHistoryStateStore } from '@/store/useSearchHistoryStore.js';
import { type SearchState, useSearchStateStore } from '@/store/useSearchStore.js';

interface SearchBarProps extends HTMLProps<HTMLDivElement> {
    slot: 'header' | 'secondary';
}

const SearchBar = memo(function SearchBar({ slot, className, ...rest }: SearchBarProps) {
    const [showRecommendation, setShowRecommendation] = useState(false);

    const { searchKeyword, updateState } = useSearchStateStore();
    const { addRecord } = useSearchHistoryStateStore();

    const pathname = usePathname();
    const isSearchPage = isRoutePathname(pathname, PageRoute.Search);
    const isExplorePage = isRoutePathname(pathname, PageRoute.Explore);
    const rootRef = useRef(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputText, setInputText] = useState(searchKeyword);

    const comeback = useComeBack();

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

    if (slot === 'header' && !isSearchPage && !isExplorePage) return null;
    if (slot === 'secondary' && (isSearchPage || isExplorePage)) return null;

    return (
        <div
            className={classNames(
                'hidden items-center pt-[10px] md:flex',
                {
                    sticky: isExplorePage,
                },
                className,
            )}
            {...rest}
            ref={rootRef}
        >
            {isSearchPage && slot === 'header' ? (
                <LeftArrowIcon width={24} height={24} className="mr-7 cursor-pointer" onClick={comeback} />
            ) : null}
            <div className="group relative flex flex-grow items-center rounded-xl border border-transparent bg-lightBg px-3 text-main focus-within:border-fireflyBrand focus-within:bg-primaryBottom">
                <SearchIcon
                    width={18}
                    height={18}
                    className="shrink-0 text-primaryMain group-focus-within:text-fireflyBrand"
                />
                <form
                    className="w-full flex-1"
                    onSubmit={(ev) => {
                        ev.preventDefault();
                        handleInputSubmit({ q: inputText });
                    }}
                >
                    <SearchInput
                        className="box-border h-[35px] focus:text-main"
                        value={inputText}
                        onChange={(ev) => setInputText(ev.currentTarget.value)}
                        onFocus={() => setShowRecommendation(true)}
                        onClear={() => setInputText('')}
                    />
                </form>
                {showRecommendation ? (
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
    const isSearchPage = isRoutePathname(pathname, PageRoute.Search);
    const isExplorePage = isRoutePathname(pathname, PageRoute.Explore);
    return isSearchPage || isExplorePage ? <SearchBar slot="header" className="px-4 py-[10px]" /> : null;
}

export function AsideSearchBar() {
    const pathname = usePathname();
    const isSearchPage = !isRoutePathname(pathname, PageRoute.Search);
    return isSearchPage ? (
        <Section title="Search Bar">
            <SearchBar slot="secondary" />
        </Section>
    ) : null;
}
