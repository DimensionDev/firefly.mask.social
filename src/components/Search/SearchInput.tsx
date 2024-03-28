'use client';

import { t } from '@lingui/macro';
import { useRef } from 'react';

import CloseIcon from '@/assets/close-circle.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onClear?: () => void;
}

export function SearchInput(props: SearchInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <label className="flex w-full flex-1 items-center" htmlFor="search">
            <input
                type="search"
                name="searchText"
                autoComplete="off"
                className=" w-full border-0 bg-transparent py-2 placeholder-secondary focus:border-0 focus:outline-0 focus:ring-0 sm:text-sm sm:leading-6"
                placeholder={t`Search…`}
                ref={inputRef}
                {...props}
            />
            <ClickableButton
                className={classNames('cursor-pointer', props.value ? 'visible' : 'invisible')}
                type="button"
                onClick={() => {
                    props.onClear?.();
                    inputRef.current?.focus();
                }}
            >
                <CloseIcon width={16} height={16} />
            </ClickableButton>
        </label>
    );
}
