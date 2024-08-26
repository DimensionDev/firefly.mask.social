import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileSourceIcon } from '@/components/ProfileSourceIcon.js';
import { type ProfileSource } from '@/constants/enum.js';

interface LoginButtonProps {
    source: ProfileSource;
    loading?: boolean;
    onClick?: (source: ProfileSource) => void;
}

export function LoginButton(props: LoginButtonProps) {
    const { source, loading = false, onClick } = props;
    return (
        <ClickableButton
            className="relative group flex w-full flex-col rounded-lg outline-none hover:bg-lightBg"
            disabled={loading}
            onClick={() => onClick?.(source)}
        >
            {loading ? (
                <LoadingIcon className="absolute inset-0 m-auto h-6 w-6 animate-spin" width={24} height={24} />
            ) : null}
            <div className="inline-flex w-full cursor-pointer flex-col items-center justify-start gap-2 rounded-lg px-4 py-6">
                <div className="relative h-[48px] w-[48px]">
                    <ProfileSourceIcon className="left-0 top-0 rounded-full" size={48} source={source} />
                </div>
            </div>
        </ClickableButton>
    );
}
