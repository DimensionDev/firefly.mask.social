import type { HTMLProps } from 'react';
import { type FieldPath, type FieldValues, useFormContext, useWatch } from 'react-hook-form';

import LoadingIcon from '@/assets/loading.svg';
import { classNames } from '@/helpers/classNames.js';

export interface FormInputContainerProps<
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends HTMLProps<HTMLDivElement> {
    isLoading?: boolean;
    maxLength?: number;
    name: TFieldName;
}

export function FormInputContainer<
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ className, children, isLoading, maxLength, name, ...props }: FormInputContainerProps<TFieldValues, TFieldName>) {
    const { control } = useFormContext<TFieldValues>();
    const value = useWatch({
        name,
        control,
    });
    return (
        <div className={classNames('relative', className)} {...props}>
            {children}
            {isLoading ? (
                <LoadingIcon width={24} height={24} className="absolute bottom-2 right-2 animate-spin" />
            ) : null}
            {maxLength && value.length > maxLength ? (
                <div className="absolute bottom-2 right-3 text-[15px] font-normal leading-6 text-fail">
                    {value.length}/{maxLength}
                </div>
            ) : null}
        </div>
    );
}
