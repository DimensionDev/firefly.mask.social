import type { HTMLProps } from 'react';
import { type FieldPath, type FieldValues, type RegisterOptions, useFormContext, useFormState } from 'react-hook-form';

import { inputClassName } from '@/helpers/inputClassName.js';

export interface InputProps<
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends HTMLProps<HTMLInputElement> {
    name: TFieldName;
    options?: RegisterOptions<TFieldValues, TFieldName>;
}

export function FormInput<
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ name, options, className, ...props }: InputProps<TFieldValues, TFieldName>) {
    const { register, control } = useFormContext<TFieldValues>();
    const { errors } = useFormState({ control });
    const error = errors[name];
    return (
        <input
            className={inputClassName({ error: !!error, className })}
            autoComplete="off"
            spellCheck="false"
            {...props}
            {...register(name, options)}
        />
    );
}
