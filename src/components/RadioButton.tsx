'use client';

import type { HTMLProps } from 'react';

import { classNames } from '@/helpers/classNames.js';

interface Props extends HTMLProps<HTMLButtonElement> {
    size?: number;
    checked: boolean;
}

export function RadioButton({ size = 40, checked, className, ...props }: Props) {
    return (
        <button
            className={classNames(
                'flex items-center justify-center rounded-full transition-all duration-200 ease-in-out',
                checked ? 'border-highlight bg-white' : 'border-secondaryLine',
                {
                    'disabled:cursor-not-allowed disabled:opacity-50': !!props.disabled,
                },
                className,
            )}
            {...props}
            type={props.type as 'button'}
            style={{
                ...props.style,
                width: size,
                height: size,
                borderWidth: checked ? 5 : 2,
            }}
        />
    );
}
