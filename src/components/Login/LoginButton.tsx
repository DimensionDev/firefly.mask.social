import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileSourceIcon } from '@/components/ProfileSourceIcon.js';
import { type ProfileSource } from '@/constants/enum.js';

interface LoginButtonProps {
    source: ProfileSource;
    onClick?: (source: ProfileSource) => void;
}

export function LoginButton(props: LoginButtonProps) {
    const { source, onClick } = props;
    return (
        <ClickableButton
            className="group flex w-full flex-col rounded-lg outline-none hover:bg-lightBg"
            onClick={() => onClick?.(source)}
        >
            <div className="inline-flex w-full cursor-pointer flex-col items-center justify-start gap-2 rounded-lg px-4 py-6">
                <div className="relative h-[48px] w-[48px]">
                    <ProfileSourceIcon className="left-0 top-0 rounded-full" size={48} source={source} />
                </div>
            </div>
        </ClickableButton>
    );
}
