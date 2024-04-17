import { memo } from 'react';

import type { Channel } from '@/providers/types/SocialMedia.js';

enum FollowLabel {
    Follow = 'Follow',
    Unfollow = 'Unfollow',
    Following = 'Following',
}

interface FollowButtonProps {
    channel: Channel;
}

export const FollowButton = memo(function FollowButton({ channel }: FollowButtonProps) {
    return null
    
    // const [followHover, setFollowHover] = useState(false);
    // const [isFollowing, { loading }, handleToggle] = useToggleFollow(channel);

    // const isLogin = useIsLogin();

    // const buttonText = isFollowing ? (followHover ? t`Unfollow` : t`Following`) : t`Follow`;
    // const buttonState = isFollowing ? (followHover ? FollowLabel.Unfollow : FollowLabel.Following) : FollowLabel.Follow;

    // return (
    //     <ClickableButton
    //         className={classNames(
    //             ' flex h-8 min-w-[100px] items-center justify-center rounded-full px-2 text-[15px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50',
    //             buttonState === FollowLabel.Follow ? ' bg-main text-primaryBottom hover:opacity-80' : '',
    //             buttonState === FollowLabel.Following ? ' border-[1.5px] border-lightMain text-lightMain' : '',
    //             buttonState === FollowLabel.Unfollow
    //                 ? ' border-[1.5px] border-danger border-opacity-50 bg-danger bg-opacity-20 text-danger'
    //                 : '',
    //         )}
    //         disabled={loading}
    //         onMouseEnter={() => {
    //             if (loading) return;
    //             setFollowHover(true);
    //         }}
    //         onMouseLeave={() => {
    //             if (loading) return;
    //             setFollowHover(false);
    //         }}
    //         onClick={() => (isLogin ? handleToggle() : LoginModalRef.open({ source: channel.source }))}
    //     >
    //         {loading ? <LoadingIcon width={16} height={16} className="mr-2 animate-spin" /> : null}
    //         {buttonText}
    //     </ClickableButton>
    // );
});
