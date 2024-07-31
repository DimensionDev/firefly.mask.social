import { type ChangeEvent, useState } from 'react';

import { ActionButton, type ButtonProps } from '@/components/Blink/ActionButton.js';

export interface InputProps {
    placeholder?: string;
    name: string;
    disabled: boolean;
    required?: boolean;
    button?: ButtonProps;
}

export function ActionInput({
    placeholder,
    name,
    button,
    disabled,
    onChange: extOnChange,
}: InputProps & { onChange?: (value: string) => void }) {
    const [value, onChange] = useState('');

    const extendedChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.currentTarget.value);
        extOnChange?.(e.currentTarget.value);
    };

    return (
        <div className="flex h-[52px] items-center gap-2 rounded-full border border-main p-1.5">
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                autoComplete="off"
                spellCheck="false"
                onChange={extendedChange}
                className="ml-2.5 flex-1 truncate border-none bg-transparent p-0 text-[15px] placeholder:text-second focus:ring-0 disabled:text-third"
            />
            {button ? (
                <div>
                    <ActionButton
                        {...button}
                        onClick={() => button.onClick({ [name]: value })}
                        disabled={button.disabled || value === ''}
                    />
                </div>
            ) : null}
        </div>
    );
}
