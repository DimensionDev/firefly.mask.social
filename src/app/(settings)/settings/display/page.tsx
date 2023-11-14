export default function Display() {
    return (
        <div className="flex w-full flex-col items-center p-[24px]">
            <div className=" w-full gap-[24px] text-[18px] font-bold leading-[24px] text-main">Display</div>
            <button className="my-[12px] inline-flex h-[60px] w-[250px] items-center justify-center gap-5 rounded-lg border border-neutral-900 bg-white px-3">
                <div className="font-['Helvetica'] text-sm font-bold leading-[18px] text-slate-950">Follow System</div>
            </button>
            <button className="my-[12px] inline-flex h-[60px] w-[250px] items-center justify-center gap-5 rounded-lg border border-neutral-900 bg-white px-3">
                <div className="relative h-2 w-2 shadow">
                    <div className="absolute left-0 top-0 h-2 w-2 rounded-full bg-green-500" />
                </div>
                <div className="font-['Helvetica'] text-sm font-bold leading-[18px] text-slate-950">Light mode</div>
            </button>
            <button className="inline-flex h-[60px] w-[250px] items-center justify-center gap-4 rounded-lg border border-white bg-slate-950 px-3">
                <div className="font-['Helvetica'] text-sm font-bold leading-[18px] text-white">Dark mode</div>
            </button>
        </div>
    );
}
