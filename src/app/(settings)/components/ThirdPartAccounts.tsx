import { t, Trans } from '@lingui/macro';
import type { FunctionComponent, SVGAttributes } from 'react';

import { ThirdPartConnectButton } from '@/app/(settings)/components/ThirdPartConnectButton.js';
import { ThirdPartDisconnectButton } from '@/app/(settings)/components/ThirdPartDisconnectButton.js';
import AppleIcon from '@/assets/apple.svg';
import GoogleIcon from '@/assets/google.svg';
import TelegramIcon from '@/assets/telegram.svg';
import { ThirdPartLoginType } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';

interface ThirdPartItemProps {
    platform: ThirdPartLoginType;
    icon: FunctionComponent<SVGAttributes<SVGElement>>;
    iconWidth: number;
    iconHeight: number;
    iconClassName?: string;
}

function ThirdPartItem({ platform, icon: PlatformIcon, iconClassName, iconWidth, iconHeight }: ThirdPartItemProps) {
    const connected = true;
    const platformName = {
        [ThirdPartLoginType.Google]: t`Google`,
        [ThirdPartLoginType.Telegram]: t`Telegram`,
        [ThirdPartLoginType.Apple]: t`Apple ID`,
    }[platform];

    return (
        <div className="mt-6 inline-flex h-[63px] w-full items-center justify-start gap-3 rounded-lg bg-white bg-bottom px-3 py-2 shadow-primary backdrop-blur dark:bg-bg">
            <div className={classNames('flex h-10 w-10 items-center justify-center rounded-full', iconClassName)}>
                <PlatformIcon width={iconWidth} height={iconHeight} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-base font-bold text-lightMain">{platformName}</span>
                <span className="truncate text-medium text-lightSecond">{'wenluo@mask.io'}</span>
            </div>
            {connected ? (
                <ThirdPartDisconnectButton platform={platform} />
            ) : (
                <ThirdPartConnectButton platform={platform} />
            )}
        </div>
    );
}

const platforms = [
    {
        platform: ThirdPartLoginType.Google,
        icon: GoogleIcon,
        iconClassName: 'border border-[#E8E8FF] bg-white',
        iconWidth: 26,
        iconHeight: 25,
    },
    {
        platform: ThirdPartLoginType.Telegram,
        icon: TelegramIcon,
        iconWidth: 40,
        iconHeight: 40,
    },
    {
        platform: ThirdPartLoginType.Apple,
        icon: AppleIcon,
        iconClassName: 'bg-black text-white dark:bg-white dark:text-black',
        iconWidth: 19,
        iconHeight: 24,
    },
];

export function ThirdPartAccounts() {
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <span className="text-base font-bold leading-[18px] text-main">
                    <Trans>Others</Trans>
                </span>
            </div>
            {platforms.map((x) => (
                <ThirdPartItem
                    key={x.platform}
                    platform={x.platform}
                    icon={x.icon}
                    iconWidth={x.iconWidth}
                    iconHeight={x.iconHeight}
                    iconClassName={x.iconClassName}
                />
            ))}
        </div>
    );
}
