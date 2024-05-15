'use client';

import { t } from '@lingui/macro';
import { useRef } from 'react';

import { CloseButton } from '@/components/CloseButton.js';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onClear?: () => void;
}

export function SearchInput({ onClear, ...rest }: SearchInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const className = `w-full border-0 bg-transparent py-2 placeholder-secondary focus:border-0 focus:outline-0 focus:ring-0 sm:text-sm sm:leading-6 ${
        rest.className ?? ''
    }`;

    return (
        <label className="flex w-full flex-1 items-center" htmlFor="search">
            <input
                type="search"
                name="searchText"
                autoComplete="off"
                spellCheck="false"
                placeholder={t`Search…`}
                ref={inputRef}
                {...rest}
                className={className}
            />
            <CloseButton
                className={rest.value ? 'visible' : 'invisible'}
                type="button"
                size={16}
                onClick={() => {
                    onClear?.();
                    inputRef.current?.focus();
                }}
            />
        </label>
    );
}
