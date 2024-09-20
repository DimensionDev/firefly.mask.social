import type { HTMLProps } from 'react';

interface TimeProps extends Omit<HTMLProps<HTMLTimeElement>, 'dateTime'> {
    dateTime: string | number | Date;
}

function toISOString(dateTime: string | number | Date) {
    try {
        return new Date(dateTime).toISOString();
    } catch {
        return `${dateTime}`;
    }
}

export function Time({ dateTime, children, ...rest }: TimeProps) {
    return (
        <time dateTime={toISOString(dateTime)} {...rest}>
            {children}
        </time>
    );
}
