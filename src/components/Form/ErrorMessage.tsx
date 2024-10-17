import type { HTMLProps } from 'react';
import { type Control, useFormState } from 'react-hook-form';

import { classNames } from '@/helpers/classNames.js';

interface ErrorMessageProps extends HTMLProps<HTMLParagraphElement> {
    name: string;
    control?: Control;
}

export function ErrorMessage({ name, control, className, ...props }: ErrorMessageProps) {
    const { errors } = useFormState({ control });
    const message = errors[name]?.message;
    if (!message || typeof message !== 'string') return null;
    return (
        <p className={classNames('text-xs font-medium leading-4 text-fail', className)} {...props}>
            {message}
        </p>
    );
}
