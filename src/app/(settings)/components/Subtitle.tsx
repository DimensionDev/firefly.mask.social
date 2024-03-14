interface SubtitleProps {
    title: React.ReactNode;
}

export function Subtitle({ title }: SubtitleProps) {
    return (
        <div className="flex w-full items-center justify-between">
            <span className="text-[18px] font-bold leading-[18px] text-main">{title}</span>
        </div>
    );
}
