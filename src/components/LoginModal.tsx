export function LoginModal() {
  return <div className="w-[600px] h-[56px] p-[16px] bg-gradient-to-b from-white to-white justify-center items-center gap-[8px] inline-flex">
    <div className="grow shrink basis-0 text-center text-slate-950 text-[16px] font-bold font-['Helvetica'] leading-snug">Login</div>
    <div className="w-[568px] h-[122px] px-4 py-6 rounded-lg flex-col justify-start items-center gap-2 inline-flex">
      <div className="w-12 h-12 relative">
        <div className="w-12 h-12 left-0 top-0 absolute bg-lime-400 rounded-full" />
      </div>
      <div className="text-slate-500 text-sm font-bold font-['Helvetica'] leading-[18px]">Lens</div>
    </div>
  </div>

}