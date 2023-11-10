import { AccountCard } from "./AccountCard";

const FireflyCommunities = [{ content: "Follow @thefireflyapp on X", link: "https://twitter.com/thefireflyapp", logo: "/svg/x-light.svg" }]
export default function Connected() {
  return <div className="flex flex-col w-full p-[24px] items-center gap-[24px]">
    <div className="w-full gap-[24px] flex items-cente justify-between">
      <span className="text-main text-[18px] font-bold leading-[24px]">Communities
      </span>
    </div>
    <div className="w-full flex items-center justify-between">
      <span className="text-main text-base font-bold leading-[18px]">Firefly</span>
    </div>
    {FireflyCommunities.map(({ content, link, logo }) => <AccountCard key={link} content={content} link={link} logo={logo} />)
    }
  </div>
}