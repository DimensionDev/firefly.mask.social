import { compact } from 'lodash-es';
import { usePathname, useRouter } from 'next/navigation.js';
import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';

import AdjustmentsIcon from '@/assets/adjustments.svg';
import FireflyIcon from '@/assets/firefly.svg';
import MagnifierIcon from '@/assets/magnifier.svg';
import MenuIcon from '@/assets/menu.svg';
import { BackButton } from '@/components/BackButton.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { SearchFilter } from '@/components/Search/SearchFilter.js';
import { SearchInput } from '@/components/Search/SearchInput.js';
import { SearchRecommendation } from '@/components/Search/SearchRecommendation.js';
import { IS_FIREFOX } from '@/constants/bowser.js';
import { PageRoute } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { DraggablePopoverRef } from '@/modals/controls.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';
import { useSearchHistoryStateStore } from '@/store/useSearchHistoryStore.js';
import { type SearchState, useSearchStateStore } from '@/store/useSearchStore.js';
import { classNames } from '@/helpers/classNames.js';

interface NavigatorBarForMobileProps {
    title: string;
    /** Fix the left button as back button */
    enableFixedBack?: boolean;
    enableSearch?: boolean;
}

const changeBodyOverflow = (overflow: 'auto' | 'hidden') => {
    if (IS_FIREFOX) document.body.style.overflowY = overflow;
};

export const NavigatorBarForMobile = memo(function NavigatorBarForMobile({
    title,
    enableFixedBack = false,
    enableSearch = true,
}: NavigatorBarForMobileProps) {
    const router = useRouter();

    const pathname = usePathname();
    const isSearchPage = isRoutePathname(pathname, PageRoute.Search);

    const [searchMode, setSearchMode] = useState(isSearchPage);
    const [showRecommendation, setShowRecommendation] = useState(false);

    const currentProfileAll = useCurrentProfileAll();
    const currentProfiles = compact(SORTED_SOCIAL_SOURCES.map((x) => currentProfileAll[x]));

    const { searchKeyword, updateState } = useSearchStateStore();
    const { updateSidebarOpen } = useNavigatorState();
    const { addRecord } = useSearchHistoryStateStore();

    const inputRef = useRef<HTMLInputElement>(null);
    const [inputText, setInputText] = useState(searchKeyword);

    const handleInputSubmit = (state: SearchState) => {
        if (state.q) addRecord(state.q);
        updateState(state);
        setShowRecommendation(false);
    };

    useLayoutEffect(() => {
        setInputText(searchKeyword);
    }, [searchKeyword]);

    useEffect(() => {
        const onTouchMove = () => {
            changeBodyOverflow('auto');
        };
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        return () => {
            onTouchMove();
            window.removeEventListener('touchmove', onTouchMove);
        };
    }, []);

    return (
        <>
            <header className="flex items-center gap-4 px-4 py-[7px] text-main">
                {searchMode || enableFixedBack ? (
                    <div className="flex h-[30px] w-[30px] shrink-0 justify-center">
                        <BackButton
                            size={30}
                            onClick={() => {
                                if (isSearchPage || enableFixedBack) router.back();
                                if (!enableSearch) return;
                                setSearchMode(false);
                                setShowRecommendation(false);
                            }}
                        />
                    </div>
                ) : (
                    <div className="flex h-[30px] shrink-0 justify-start">
                        <ClickableButton
                            className="flex items-center justify-center"
                            onClick={() => {
                                updateSidebarOpen(true);
                            }}
                        >
                            {currentProfiles.length ? (
                                currentProfiles.map((x) => (
                                    <div className="relative -mr-2" key={`${x.source}_${x.profileId}`}>
                                        <ProfileAvatar size={30} profile={x} enableSourceIcon={false} />
                                    </div>
                                ))
                            ) : (
                                <MenuIcon />
                            )}
                        </ClickableButton>
                    </div>
                )}
                <h1 className="flex h-10 flex-1 items-center justify-center">
                    {searchMode ? (
                        <form
                            className="flex flex-1 items-center rounded-md bg-lightBg px-3"
                            onSubmit={(ev) => {
                                ev.preventDefault();
                                handleInputSubmit({ q: inputText });
                            }}
                        >
                            <MagnifierIcon width={18} height={18} />
                            <SearchInput
                                value={inputText}
                                onChange={(ev) => setInputText(ev.currentTarget.value)}
                                onFocus={() => {
                                    setShowRecommendation(true);
                                    changeBodyOverflow('hidden');
                                }}
                                onClick={() => changeBodyOverflow('hidden')}
                                onBlur={() => changeBodyOverflow('auto')}
                                onClear={() => setInputText('')}
                            />
                        </form>
                    ) : (
                        <>
                            {currentProfiles.length && title ? (
                                <span className="text-[18px] font-bold leading-[24px]">{title}</span>
                            ) : (
                                <FireflyIcon
                                    className={classNames('relative', {
                                        '-left-2': currentProfiles.length === 3,
                                    })}
                                />
                            )}
                        </>
                    )}
                </h1>
                <div className="flex h-[30px] w-[30px] justify-center">
                    {enableSearch ? (
                        searchMode ? (
                            <ClickableButton
                                onClick={() => {
                                    DraggablePopoverRef.open({
                                        content: <SearchFilter />,
                                    });
                                }}
                            >
                                <AdjustmentsIcon />
                            </ClickableButton>
                        ) : (
                            <ClickableButton
                                onClick={() => {
                                    inputRef.current?.focus();
                                    setSearchMode(true);
                                }}
                            >
                                <MagnifierIcon />
                            </ClickableButton>
                        )
                    ) : null}
                </div>
            </header>
            {showRecommendation && !isSearchPage ? (
                <SearchRecommendation
                    fullScreen
                    keyword={searchKeyword}
                    onSearch={() => setShowRecommendation(false)}
                    onSelect={() => setShowRecommendation(false)}
                    onClear={() => inputRef.current?.focus()}
                />
            ) : null}
        </>
    );
});
