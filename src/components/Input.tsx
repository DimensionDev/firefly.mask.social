import type { HTMLProps } from 'react';

import { inputClassName } from '@/helpers/inputClassName.js';

export interface InputProps extends HTMLProps<HTMLInputElement> {
    error?: boolean;
}

export function Input({ error, className, ...props }: InputProps) {
    return <input className={inputClassName({ error, className })} autoComplete="off" {...props} />;
}
