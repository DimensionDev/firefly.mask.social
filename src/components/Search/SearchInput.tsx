import { t } from '@lingui/macro';
import { useRef } from 'react';

import { ClearButton } from '@/components/ClearButton.js';
import { classNames } from '@/helpers/classNames.js';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onClear?: () => void;
}

export function SearchInput({ onClear, ...rest }: SearchInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <label className="flex w-full flex-1 items-center">
            <input
                type="search"
                name="searchText"
                autoComplete="off"
                spellCheck="false"
                placeholder={t`Search...`}
                autoFocus
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
