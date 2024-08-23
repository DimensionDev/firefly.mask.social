import { Trans } from '@lingui/macro';
import type { HTMLProps } from 'react';

import LineArrowUpSVG from '@/assets/line-arrow-up.svg';
import { Image } from '@/components/Image.js';
import { classNames } from '@/helpers/classNames.js';

interface ShowMoreCommentsProps extends HTMLProps<HTMLDivElement> {
    avatarUrls?: string[];
    maxAvatarCount?: number; // show all avatar urls when it is 0. default to 3
    isOpen?: boolean;
}

export function ShowMoreComments(props: ShowMoreCommentsProps) {
    const { isOpen = false, maxAvatarCount = 5, onClick, className } = props;
    const avatarUrls = maxAvatarCount ? props.avatarUrls?.slice(0, maxAvatarCount) : props.avatarUrls;
    return (
        <div
            className={classNames('w-full', {
                'pb-5': !isOpen,
            })}
        >
            <div
                className={classNames(
                    'flex w-full cursor-pointer items-center justify-center border-b-[1px] border-b-line py-3 text-link',
                    className,
                )}
                onClick={onClick}
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
                <div className="mx-3 text-medium font-bold leading-6">
                    {isOpen ? <Trans>Hide more comments</Trans> : <Trans>Show more comments</Trans>}
                </div>
                <LineArrowUpSVG
                    className={classNames('h-5 w-5 duration-100', {
                        'rotate-180': !isOpen,
                    })}
                />
            </div>
        </div>
    );
}
