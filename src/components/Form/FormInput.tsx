import type { HTMLProps } from 'react';
import { type FieldPath, type FieldValues, type RegisterOptions, useFormContext, useFormState } from 'react-hook-form';

import { classNames } from '@/helpers/classNames.js';

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
            className={classNames(
                'w-full rounded-2xl border-none bg-bg text-main !outline-offset-0 ring-0 duration-100 focus:bg-transparent focus:outline-1',
                error ? 'focus:shadow-inputDanger focus:outline-fail' : 'focus:outline-link',
                className,
            )}
            autoComplete="off"
            {...props}
            {...register(name, options)}
        />
    );
}
