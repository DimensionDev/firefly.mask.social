import type { HTMLProps } from 'react';

interface SectionProps extends HTMLProps<HTMLDivElement> {
    title: string;
    hiddenTitle?: boolean;
}

export function Section({ title, className, hiddenTitle = true, children }: SectionProps) {
    return (
        <section className={className}>
            <h1 className={hiddenTitle ? 'sr-only' : ''}>{title}</h1>
            {children}
        </section>
    );
}
