export default function Display() {
  return <div className="flex flex-col w-full p-[24px] items-center">
    <div className=" text-main text-[18px] font-bold leading-[24px] w-full gap-[24px]">Display</div>
    <button className="w-[250px] h-[60px] px-3 bg-white rounded-lg border border-neutral-900 my-[12px] justify-center items-center gap-5 inline-flex">
      <div className="text-slate-950 text-sm font-bold font-['Helvetica'] leading-[18px]">Follow System</div>
    </button>
    <button className="w-[250px] h-[60px] px-3 bg-white rounded-lg border border-neutral-900 my-[12px] justify-center items-center gap-5 inline-flex">
      <div className="w-2 h-2 relative shadow">
        <div className="w-2 h-2 left-0 top-0 absolute bg-green-500 rounded-full" />
      </div>
      <div className="text-slate-950 text-sm font-bold font-['Helvetica'] leading-[18px]">Light mode</div>
    </button>
    <button className="w-[250px] h-[60px] px-3 bg-slate-950 rounded-lg border border-white justify-center items-center gap-4 inline-flex">
      <div className="text-white text-sm font-bold font-['Helvetica'] leading-[18px]">Dark mode</div>
    </button>
  </div>
}