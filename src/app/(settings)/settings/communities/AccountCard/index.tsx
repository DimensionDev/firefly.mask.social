import Image from 'next/image'
import Link from 'next/link'

interface AccountCardProps {
  logo: string
  link: string
  content: string
}
export function AccountCard({ logo, link, content }: AccountCardProps) {
  return <div className="w-full h-[48px] px-[12px] py-[8px] bg-white rounded-lg justify-start items-center gap-[8px] inline-flex" style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}>
    <Image src={logo} width={24} height={24} alt="security" />
    <div className="grow shrink basis-0 flex-col justify-center items-start gap-1 inline-flex">
      <div className=" text-textMain text-[14px] font-bold leading-[18px]">{content}</div>
    </div>
    <Link href={link} target='_blank'>
      <Image src="/svg/link.svg" width={16} height={16} alt="link" />
    </Link>
  </div >
}