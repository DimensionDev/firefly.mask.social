import LineArrowUpSVG from '@/assets/line-arrow-up.svg';
import { Image } from '@/components/Image.js';
import { classNames } from '@/helpers/classNames.js';

export interface ShowMoreCommentsProps {
    avatarUrls?: string[];
    maxAvatarCount?: number | false;
    isOpen?: boolean;
    onClick?: () => void;
    className?: string;
}

export function ShowMoreComments(props: ShowMoreCommentsProps) {
    const { isOpen = false, maxAvatarCount = 3, onClick, className } = props;
    const avatarUrls = maxAvatarCount ? props.avatarUrls?.slice(0, maxAvatarCount) : props.avatarUrls;
    return (
        <div
            className={classNames(
                'flex w-full cursor-pointer items-center justify-center border-b-[1px] border-b-line py-3 text-link',
                className,
            )}
            onClick={() => onClick?.()}
        >
            {avatarUrls && avatarUrls.length > 0 ? (
                <div className="flex space-x-[-4px]">
                    {avatarUrls.map((url) => (
                        <Image
                            width={24}
                            height={24}
                            key={url}
                            className="h-6 w-6 rounded-full"
                            src={url}
                            alt="avatar"
                        />
                    ))}
                </div>
            ) : null}
            <div className="mx-3 text-[15px] font-bold leading-6">Show more comments</div>
            <LineArrowUpSVG
                className={classNames('h-5 w-5 duration-100', {
                    'rotate-180': isOpen,
                })}
            />
        </div>
    );
}
