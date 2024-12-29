'use client';

import { useLingui } from '@lingui/react/macro';
import { type HTMLProps, useRef } from 'react';

import { ClearButton } from '@/components/IconButton.js';
import { classNames } from '@/helpers/classNames.js';

interface SearchInputProps extends HTMLProps<HTMLInputElement> {
    onClear?: () => void;
}

export function SearchInput({ onClear, ref, ...rest }: SearchInputProps) {
    const { t } = useLingui();
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <label className="flex w-full flex-1 items-center">
            <input
                type="search"
                name="searchText"
                autoComplete="off"
                spellCheck="false"
                placeholder={t`Search...`}
                ref={inputRef}
                {...rest}
                className={classNames(
                    `w-full border-0 bg-transparent py-2 placeholder-secondary focus:border-0 focus:outline-0 focus:ring-0 dark:text-input sm:text-sm sm:leading-6`,
                    rest.className,
                )}
            />
            {rest.value ? (
                <ClearButton
                    type="button"
                    className="text-highlight"
                    IconProps={{ className: 'text-inherit' }}
                    size={16}
                    onClick={() => {
                        onClear?.();
                        inputRef.current?.focus();
                    }}
                />
            ) : null}
        </label>
    );
}
