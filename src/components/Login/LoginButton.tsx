import LoadingIcon from '@/assets/loading.svg';
import { AuthSourceIcon } from '@/components/AuthSourceIcon.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileSourceIcon } from '@/components/ProfileSourceIcon.js';
import { AuthSource, type ProfileSource } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';

interface LoginButtonProps {
    source?: ProfileSource;
    authSource?: AuthSource;
    loading?: boolean;
    onClick?: (source: ProfileSource | AuthSource) => void;
}

export function LoginButton(props: LoginButtonProps) {
    const { source, authSource, loading = false, onClick } = props;
    return (
        <ClickableButton
            className={classNames('group relative flex w-full flex-col outline-none hover:bg-lightBg md:rounded-lg', {
                'hover:lightBg cursor-pointer': !loading,
            })}
            disabled={loading}
            onClick={() => {
                const targetSource = source || authSource;
                if (targetSource && onClick) onClick(targetSource);
            }}
        >
            <div className="inline-flex w-full flex-col items-center justify-start gap-2 py-6 md:rounded-lg">
                <div className="relative h-[48px] w-[48px]">
                    {source ? (
                        <ProfileSourceIcon className="left-0 top-0 rounded-full" size={48} source={source} />
                    ) : null}
                    {authSource ? (
                        <AuthSourceIcon className="left-0 top-0 rounded-full" size={48} source={authSource} />
                    ) : null}
                </div>
            </div>
            {loading ? (
                <LoadingIcon
                    className="absolute inset-0 m-auto h-6 w-6 animate-spin text-primaryBottom"
                    width={24}
                    height={24}
                />
            ) : null}
        </ClickableButton>
    );
}
