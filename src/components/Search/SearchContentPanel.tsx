import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { Fragment, type PropsWithChildren, type ReactNode, useEffect, useRef, useState } from 'react';

import LineArrowUp from '@/assets/line-arrow-up.svg';
import LoadingIcon from '@/assets/loading.svg';
import { SearchInput } from '@/components/Search/SearchInput.js';
import { classNames } from '@/helpers/classNames.js';

interface FilterPopoverProps<F> {
    placeholder: string;
    data: F[];
    selected?: F;
    popoverClassName?: string;
    isSelected?: (item: F, current: F) => boolean;
    onSelected: (item?: F) => void;
    itemRenderer: (item: F, isTag?: boolean) => ReactNode;
}

interface SearchContentPanelProps<T, F = never> {
    showFilter?: boolean;
    isLoading?: boolean;
    placeholder?: string;
    filterProps: FilterPopoverProps<F>;
    keyword: string;
    onSearch: (searchText: string) => void;
    data: T[];
    itemRenderer?: (item: T) => ReactNode;
    onSelected?: (selected: T) => void;
    listKey?: (item: T) => string;
    isSelected?: (item: T) => boolean;
}

function FilterPopover<F>({
    placeholder,
    data,
    selected,
    popoverClassName,
    isSelected,
    onSelected,
    itemRenderer,
}: FilterPopoverProps<F>) {
    useEffect(() => {
        if (selected && data) {
            const index = data.findIndex((item) => isSelected?.(item, selected));
            // data changed, but selected item is not in the list, so reset selected
            if (index === -1) onSelected();
        }
    }, [selected, data, isSelected, onSelected]);

    const optionRenderer = (item: F, index: number, onClose: () => void) => (
        <div
            key={index}
            onClick={() => {
                onSelected(index === -1 ? undefined : item);
                onClose();
            }}
            className={classNames('cursor-pointer px-3 py-1 text-left text-xs text-main hover:bg-lightBg', {
                'opacity-50': selected ? (isSelected?.(item, selected) ?? false) : index === -1,
            })}
        >
            {index === -1 ? placeholder : itemRenderer(item)}
        </div>
    );

    return (
        <Popover as="div" className="relative">
            {({ open, close }) => (
                <>
                    <PopoverButton className="flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-lightLineSecond px-2 text-xs text-main focus:outline-none disabled:cursor-default">
                        {selected ? itemRenderer?.(selected, true) : placeholder}
                        <LineArrowUp
                            className={classNames('h-3 w-3 transition-all duration-200 ease-in-out', {
                                'rotate-180': !open,
                            })}
                        />
                    </PopoverButton>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <PopoverPanel
                            className={classNames(
                                'no-scrollbar absolute left-0 top-10 z-10 flex max-h-[275px] flex-col gap-2 overflow-y-auto rounded-lg bg-lightBottom py-3 text-medium shadow-popover dark:border dark:border-line dark:bg-darkBottom dark:shadow-none md:max-h-[370px]',
                                popoverClassName,
                            )}
                        >
                            {optionRenderer(data[0], -1, close)}
                            {data.map((item, i) => optionRenderer(item, i, close))}
                        </PopoverPanel>
                    </Transition>
                </>
            )}
        </Popover>
    );
}

export function SearchContentPanel<T, F>({
    showFilter = true,
    isLoading,
    filterProps,
    placeholder,
    children,
    itemRenderer,
    keyword,
    onSearch,
    data,
    onSelected,
    listKey,
    isSelected,
}: PropsWithChildren<SearchContentPanelProps<T, F>>) {
    const [selectedFilter, setSelectedFilter] = useState<F>();
    const listRef = useRef<HTMLDivElement>(null);

    const selectedIndex = data?.findIndex((item) => isSelected?.(item)) ?? -1;

    useEffect(() => {
        // Scroll to the first selected item
        if (selectedIndex >= 0 && listRef.current) {
            const selectedEl = listRef.current.children[selectedIndex];
            selectedEl?.scrollIntoView({ block: 'center' });
        }
    }, [data, selectedIndex]);

    return (
        <div className="flex h-full w-full flex-col">
            <div className="flex items-center gap-2.5">
                {showFilter ? (
                    <FilterPopover
                        {...filterProps}
                        selected={filterProps.selected ?? selectedFilter}
                        onSelected={filterProps.onSelected ?? setSelectedFilter}
                    />
                ) : null}
                <div className="flex-1 rounded-lg !border border-transparent !bg-lightBg transition-all focus-within:border-highlight">
                    <SearchInput
                        placeholder={placeholder}
                        className="!py-1.5 px-3"
                        value={keyword}
                        onChange={(event) => onSearch(event.currentTarget.value)}
                        onClear={() => onSearch('')}
                    />
                </div>
            </div>
            <div ref={listRef} className="no-scrollbar mt-2 min-h-0 flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <LoadingIcon className="animate-spin" width={24} height={24} />
                    </div>
                ) : null}
                {itemRenderer
                    ? data.map((item, i) => (
                          <div
                              key={listKey ? listKey(item) : i}
                              onClick={() => onSelected?.(item)}
                              className={classNames('cursor-pointer hover:bg-lightBg', {
                                  'opacity-50': isSelected?.(item) ?? false,
                              })}
                          >
                              {itemRenderer(item)}
                          </div>
                      ))
                    : null}
                {children}
            </div>
        </div>
    );
}
