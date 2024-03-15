interface SubtitleProps {
    children?: React.ReactNode;
}

export function Subtitle({ children }: SubtitleProps) {
    return (
        <div className="flex w-full items-center justify-between">
            <span className="text-[18px] font-bold leading-[18px] text-main">{children}</span>
        </div>
    );
}
