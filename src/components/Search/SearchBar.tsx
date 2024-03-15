'use client';

import { t } from '@lingui/macro';
import { usePathname, useRouter } from 'next/navigation.js';
import { type ChangeEvent, memo, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import CloseIcon from '@/assets/close-circle.svg';
import LeftArrowIcon from '@/assets/left-arrow.svg';
import SearchIcon from '@/assets/search.svg';
import { SearchRecommendation } from '@/components/Search/SearchRecommendation.js';
import { classNames } from '@/helpers/classNames.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useSearchHistoryStateStore } from '@/store/useSearchHistoryStore.js';
import { type SearchState, useSearchState } from '@/store/useSearchState.js';

interface SearchBarProps {
    source: 'header' | 'secondary';
}

const SearchBar = memo(function SearchBar(props: SearchBarProps) {
    const router = useRouter();
    const [showRecommendation, setShowRecommendation] = useState(false);

    const { searchKeyword, updateState } = useSearchState();
    const { addRecord } = useSearchHistoryStateStore();

    const pathname = usePathname();
    const isSearchPage = isRoutePathname(pathname, '/search');

    const inputRef = useRef<HTMLInputElement>(null);
    const [inputText, setInputText] = useState(searchKeyword);

    const rootRef = useRef(null);

    useOnClickOutside(rootRef, () => {
        setShowRecommendation(false);
    });

    const handleInputChange = (evt: ChangeEvent<HTMLInputElement>) => {
        setInputText(evt.target.value);
    };

    const handleInputSubmit = (state: SearchState) => {
        if (state.q) addRecord(state.q);
        updateState(state);
        setShowRecommendation(false);
    };

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
            <div
                className={`
              relative flex flex-grow items-center rounded-xl bg-lightBg px-3 text-main
            `}
            >
                <SearchIcon width={18} height={18} className="shrink-0" />
                <form
                    className="w-full flex-1"
                    onSubmit={(evt) => {
                        evt.preventDefault();
                        handleInputSubmit({ q: inputText });
                    }}
                >
                    <label className="flex w-full items-center" htmlFor="search">
                        <input
                            type="search"
                            name="searchText"
                            autoComplete="off"
                            value={inputText}
                            className={`
                              w-full border-0 bg-transparent py-2 placeholder-secondary

                              focus:border-0 focus:outline-0 focus:ring-0

                              sm:text-sm sm:leading-6
                            `}
                            placeholder={t`Search…`}
                            ref={inputRef}
                            onChange={handleInputChange}
                            onFocus={() => setShowRecommendation(true)}
                        />
                        <CloseIcon
                            className={classNames('cursor-pointer', inputText ? 'visible' : 'invisible')}
                            width={16}
                            height={16}
                            onClick={(evt) => {
                                evt.preventDefault();
                                evt.stopPropagation();
                                setInputText('');
                                inputRef.current?.focus();
                            }}
                        />
                    </label>
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
