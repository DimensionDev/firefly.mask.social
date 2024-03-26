import { t } from '@lingui/macro';
import { compact } from 'lodash-es';
import { usePathname, useRouter } from 'next/navigation.js';
import { type ChangeEvent, memo, useRef, useState } from 'react';

import AdjustmentsIcon from '@/assets/adjustments.svg';
import CloseIcon from '@/assets/close-circle.svg';
import FireflyIcon from '@/assets/firefly.svg';
import LeftArrowIcon from '@/assets/left-arrow.svg';
import MagnifierIcon from '@/assets/magnifier.svg';
import MenuIcon from '@/assets/menu.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { SearchFilter } from '@/components/Search/SearchFilter.js';
import { SearchRecommendation } from '@/components/Search/SearchRecommendation.js';
import { classNames } from '@/helpers/classNames.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { DraggablePopoverRef } from '@/modals/controls.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';
import { useSearchHistoryStateStore } from '@/store/useSearchHistoryStore.js';
import { type SearchState, useSearchState } from '@/store/useSearchState.js';

interface NavigatorBarForMobileProps {
    title: string;
    /** Fix the left button as back button */
    enableFixedBack?: boolean;
    enableSearch?: boolean;
}

export const NavigatorBarForMobile = memo(function NavigatorBarForMobile({
    title,
    enableFixedBack = false,
    enableSearch = true,
}: NavigatorBarForMobileProps) {
    const router = useRouter();

    const pathname = usePathname();
    const isSearchPage = isRoutePathname(pathname, '/search');

    const [searchMode, setSearchMode] = useState(isSearchPage);
    const [showRecommendation, setShowRecommendation] = useState(false);

    const lensProfile = useLensStateStore.use.currentProfile?.();
    const farcasterProfile = useFarcasterStateStore.use.currentProfile?.();

    const { updateState } = useSearchState();
    const { updateSidebarOpen } = useNavigatorState();
    const { addRecord } = useSearchHistoryStateStore();

    const inputRef = useRef<HTMLInputElement>(null);
    const [inputText, setInputText] = useState('');

    const handleInputChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setInputText(ev.target.value);
    };

    const handleInputSubmit = (state: SearchState) => {
        if (state.q) addRecord(state.q);
        updateState(state);
        setShowRecommendation(false);
    };

    return (
        <>
            <header className=" flex items-center gap-4 px-4 py-[7px] text-main">
                {searchMode || enableFixedBack ? (
                    <div className=" flex h-[30px] w-[30px] justify-center">
                        <ClickableButton
                            onClick={() => {
                                if (isSearchPage || enableFixedBack) router.back();
                                if (!enableSearch) return;
                                setSearchMode(false);
                                setShowRecommendation(false);
                            }}
                        >
                            <LeftArrowIcon />
                        </ClickableButton>
                    </div>
                ) : (
                    <div className=" flex h-[30px] justify-start">
                        <ClickableButton
                            className=" flex items-center justify-center"
                            onClick={() => {
                                updateSidebarOpen(true);
                            }}
                        >
                            {farcasterProfile || lensProfile ? (
                                compact([farcasterProfile, lensProfile]).map((x, i) => (
                                    <div
                                        className={classNames(' relative', {
                                            ' z-10': i === 0,
                                            ' left-[-6px] z-0': i === 1,
                                        })}
                                        key={`${x.source}_${x.profileId}`}
                                    >
                                        <ProfileAvatar size={30} profile={x} enableSourceIcon={false} />
                                    </div>
                                ))
                            ) : (
                                <MenuIcon />
                            )}
                        </ClickableButton>
                    </div>
                )}
                <h1 className=" flex h-10 flex-1 items-center justify-center">
                    {searchMode ? (
                        <form
                            className=" relative flex flex-1 items-center"
                            onSubmit={(ev) => {
                                ev.preventDefault();
                                handleInputSubmit({ q: inputText });
                            }}
                        >
                            <MagnifierIcon className=" absolute left-3" width={18} height={18} />
                            <input
                                type="search"
                                name="searchText"
                                autoComplete="off"
                                value={inputText}
                                className=" flex-1 rounded-xl border-none bg-bg px-0 py-[11px] pl-10 text-sm leading-[18px]"
                                placeholder={t`Search…`}
                                ref={inputRef}
                                onChange={handleInputChange}
                                onFocus={() => setShowRecommendation(true)}
                            />
                            <ClickableButton
                                className={classNames(
                                    'absolute right-3 cursor-pointer',
                                    inputText ? 'visible' : 'invisible',
                                )}
                                onClick={() => {
                                    setInputText('');
                                    inputRef.current?.focus();
                                }}
                            >
                                <CloseIcon width={16} height={16} />
                            </ClickableButton>
                        </form>
                    ) : (
                        <>
                            {(farcasterProfile || lensProfile) && title ? (
                                <span className=" text-[20px] font-bold leading-[24px]">{title}</span>
                            ) : (
                                <FireflyIcon />
                            )}
                        </>
                    )}
                </h1>
                <div className=" flex h-[30px] w-[30px] justify-center">
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
                    keyword={inputText}
                    onSearch={() => setShowRecommendation(false)}
                    onSelect={() => setShowRecommendation(false)}
                    onClear={() => inputRef.current?.focus()}
                />
            ) : null}
        </>
    );
});
