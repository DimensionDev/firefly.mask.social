import { t } from '@lingui/macro';
import { useRef } from 'react';

import CloseCircleIcon from '@/assets/close-circle.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onClear?: () => void;
}

export function SearchInput({ onClear, ...rest }: SearchInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <label className="flex w-full flex-1 items-center" htmlFor="search">
            <input
                type="search"
                name="searchText"
                autoComplete="off"
                spellCheck="false"
                placeholder={t`Search...`}
                ref={inputRef}
                {...rest}
                className={classNames(
                    `w-full border-0 bg-transparent py-2 placeholder-secondary focus:border-0 focus:outline-0 focus:ring-0 sm:text-sm sm:leading-6`,
                    rest.className,
                )}
            />
            <Tooltip content={t`Clear`} className="inline-flex items-center" placement="top">
                <ClickableButton
                    className={classNames('focus-within:text-[#4C4AA9]', rest.value ? 'visible' : 'invisible')}
                    onClick={() => {
                        onClear?.();
                        inputRef.current?.focus();
                    }}
                >
                    <CloseCircleIcon width={16} height={16} className="text-[#4c4aa9]" />
                </ClickableButton>
            </Tooltip>
        </label>
    );
}
