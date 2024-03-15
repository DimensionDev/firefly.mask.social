interface HeadlineProps {
    title: React.ReactNode;
}

export function Headline({ title }: HeadlineProps) {
    return (
        <div
            className={`
          hidden w-full items-center justify-between gap-6

          md:flex
        `}
        >
            <span className="text-[20px] font-bold leading-[24px] text-main">{title}</span>
        </div>
    );
}
