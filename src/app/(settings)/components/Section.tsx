interface SectionProps {
    children: React.ReactNode;
}

export function Section({ children }: SectionProps) {
    return <div className="flex w-full flex-col items-center gap-6 p-6">{children}</div>;
}
