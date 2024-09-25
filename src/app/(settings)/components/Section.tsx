import { classNames } from '@/helpers/classNames.js';

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Section({ className, children }: SectionProps) {
    return <div className={classNames('flex w-full flex-col items-center gap-6 p-6', className)}>{children}</div>;
}
