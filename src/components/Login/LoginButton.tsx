import { SourceIcon } from '@/components/SourceIcon.jsx';
import { SocialPlatform } from '@/constants/enum.js';
import { resolveSourceName } from '@/helpers/resovleSourceName.js';

interface LoginButtonProps {
    source: SocialPlatform;
    onClick?: (source: SocialPlatform) => void;
}

export function LoginButton(props: LoginButtonProps) {
    const { source, onClick } = props;
    return (
        <button
            className=" group flex w-full flex-col rounded-lg p-[16px] hover:bg-lightBg"
            onClick={() => onClick?.(source)}
        >
            <div className=" inline-flex w-full cursor-pointer flex-col items-center justify-start gap-[8px] rounded-lg px-[16px] py-[24px]">
                <div className="relative h-[48px] w-[48px]">
                    <SourceIcon className="left-0 top-0 rounded-full" size={48} source={source} />
                </div>
                <div className="text-sm font-bold leading-[18px] text-lightSecond group-hover:text-lightMain">
                    {resolveSourceName(source)}
                </div>
            </div>
        </button>
    );
}
