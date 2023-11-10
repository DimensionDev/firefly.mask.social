import Image from 'next/image'

interface AccountCardProps {
  avatar: string
  name: string
  userName: string
  logout: () => void
  isCurrent: boolean
  type: 'lens' | 'farcaster'
}
export function AccountCard({ avatar, name, userName, logout, isCurrent, type }: AccountCardProps) {
  return <div className="w-full h-[63px] px-[12px] py-[8px] bg-white rounded-lg shadow backdrop-blur-lg justify-start items-center gap-[8px] inline-flex">
    <div className="w-[48px] h-[40px] justify-start items-start flex">
      <div className="w-[40px] h-[40px] relative">
        <div className="w-[36px] h-[36px] left-0 top-0 absolute rounded-[99px] shadow backdrop-blur-lg">
          <Image src={avatar} alt="avatar" width={36} height={36} />
        </div>
        <Image className="w-[16px] h-[16px] left-[24px] top-[24px] absolute rounded-[99px] shadow border border-white" src={type === 'lens' ? '/svg/lens.svg' : '/svg/farcaster.svg'} alt="logo" width={16} height={16} />
      </div>
    </div>
    <div className="grow shrink basis-0 flex-col justify-center items-start gap-1 inline-flex">
      <div className="text-neutral-900 text-base font-medium font-['PingFang SC']">{name}</div>
      <div className="text-neutral-500 text-[15px] font-normal font-['PingFang SC']">@{userName}</div>
    </div>
    {
      isCurrent ?
        <button className="text-red-500 text-xs font-medium font-['Inter'] leading-none">Log out</button>
        : <button className="text-right text-neutral-900 text-xs font-medium font-['Inter'] leading-none">Switch</button>
    }
  </div >
}