import { Trans } from '@lingui/macro';
import type { FunctionComponent, SVGAttributes } from 'react';

import { ThirdPartConnectButton } from '@/app/(settings)/components/ThirdPartConnectButton.js';
import { ThirdPartDisconnectButton } from '@/app/(settings)/components/ThirdPartDisconnectButton.js';
import AppleIcon from '@/assets/apple-small.svg';
import GoogleIcon from '@/assets/google-small.svg';
import TelegramIcon from '@/assets/telegram.svg';
import { Source, type ThirdPartySource } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useThirdPartyStateStore } from '@/store/useProfileStore.js';

interface ThirdPartItemProps {
    source: ThirdPartySource;
    icon: FunctionComponent<SVGAttributes<SVGElement>>;
    iconWidth: number;
    iconHeight: number;
    iconClassName?: string;
}

function ThirdPartItem({ source, icon: PlatformIcon, iconClassName, iconWidth, iconHeight }: ThirdPartItemProps) {
    const { accounts } = useThirdPartyStateStore();

    const account = accounts.find((x) => x.profile.profileSource === source);

    const connected = !!account;

    console.log('[DEBUG] ThirdPartItem', { source, connected, account });

    return (
        <div className="mt-6 inline-flex h-[63px] w-full items-center justify-start gap-3 rounded-lg bg-white bg-bottom px-3 py-2 shadow-primary backdrop-blur dark:bg-bg">
            <div className={classNames('flex h-10 w-10 items-center justify-center rounded-full', iconClassName)}>
                <PlatformIcon width={iconWidth} height={iconHeight} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-base font-bold text-lightMain">{resolveSourceName(source)}</span>
                {connected ? (
                    <span className="truncate text-medium text-lightSecond">{account.profile.displayName}</span>
                ) : null}
            </div>
            {connected ? <ThirdPartDisconnectButton account={account} /> : <ThirdPartConnectButton source={source} />}
        </div>
    );
}

const platforms: ThirdPartItemProps[] = [
    {
        source: Source.Google,
        icon: GoogleIcon,
        iconClassName: 'border border-[#E8E8FF] bg-white',
        iconWidth: 26,
        iconHeight: 25,
    },
    {
        source: Source.Telegram,
        icon: TelegramIcon,
        iconWidth: 40,
        iconHeight: 40,
    },
    {
        source: Source.Apple,
        icon: AppleIcon,
        iconClassName: 'bg-black text-white dark:bg-white dark:text-black',
        iconWidth: 19,
        iconHeight: 24,
    },
] as const;

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
                    key={x.source}
                    source={x.source}
                    icon={x.icon}
                    iconWidth={x.iconWidth}
                    iconHeight={x.iconHeight}
                    iconClassName={x.iconClassName}
                />
            ))}
        </div>
    );
}
