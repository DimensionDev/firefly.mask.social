import { classNames } from '@/helpers/classNames.js';

export function inputClassName({
    error,
    className,
}: {
    error?: boolean;
    className?: string;
} = {}) {
    return classNames(
        'leading-12 h-12 w-full rounded-2xl border-none bg-bg text-main !outline-offset-0 ring-0 duration-100 focus:bg-transparent focus:outline-1',
        error ? 'focus:shadow-inputDanger focus:outline-fail' : 'focus:outline-link',
        className,
    );
}
