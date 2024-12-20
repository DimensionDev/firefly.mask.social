import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import type { FunctionComponent, SVGAttributes } from 'react';

import { ThirdPartConnectButton } from '@/app/(settings)/components/ThirdPartConnectButton.js';
import { ThirdPartDisconnectButton } from '@/app/(settings)/components/ThirdPartDisconnectButton.js';
import AppleIcon from '@/assets/apple-small.svg';
import GoogleIcon from '@/assets/google-small.svg';
import LoadingIcon from '@/assets/loading.svg';
import TelegramIcon from '@/assets/telegram.svg';
import { Source, SourceInURL, type ThirdPartySource } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { Account } from '@/providers/types/Account.js';
import { useThirdPartyStateStore } from '@/store/useProfileStore.js';

interface ThirdPartItemProps {
    source: ThirdPartySource;
    icon: FunctionComponent<SVGAttributes<SVGElement>>;
    iconWidth: number;
    iconHeight: number;
    iconClassName?: string;
    account?: Account;
    loading?: boolean;
    onDisconnected?: () => void;
}

function ThirdPartItem({
    source,
    icon: PlatformIcon,
    iconClassName,
    iconWidth,
    iconHeight,
    account,
    loading,
    onDisconnected,
}: ThirdPartItemProps) {
    const connected = !!account;

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
            {loading ? (
                <LoadingIcon width={24} height={24} className="animate-spin text-lightMain" />
            ) : connected ? (
                <ThirdPartDisconnectButton account={account} onSucceed={onDisconnected} />
            ) : (
                <ThirdPartConnectButton source={source} />
            )}
        </div>
    );
}

const platforms = [
    {
        source: Source.Google,
        icon: GoogleIcon,
        iconClassName: 'border border-[#E8E8FF] bg-white',
        iconWidth: 26,
        iconHeight: 25,
        platform: SourceInURL.Google,
    },
    {
        source: Source.Telegram,
        icon: TelegramIcon,
        iconClassName: '',
        iconWidth: 40,
        iconHeight: 40,
        platform: SourceInURL.Telegram,
    },
    {
        source: Source.Apple,
        icon: AppleIcon,
        iconClassName: 'bg-black text-white dark:bg-white dark:text-black',
        iconWidth: 19,
        iconHeight: 24,
        platform: SourceInURL.Apple,
    },
] as const;

export function ThirdPartAccounts() {
    const profiles = useCurrentProfileAll();
    const { accounts } = useThirdPartyStateStore();

    const profileIds = compact([
        ...Object.values(profiles).map((x) => x?.profileId),
        ...accounts.map((x) => x?.profile?.profileId),
    ]);
    const { isLoading, data, refetch } = useQuery({
        queryKey: ['allConnections', ...profileIds],
        enabled: !!profileIds.length,
        queryFn: () => {
            return runInSafeAsync(() => FireflyEndpointProvider.getAllConnections());
        },
    });

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <span className="text-base font-bold leading-[18px] text-main">
                    <Trans>Others</Trans>
                </span>
            </div>
            {platforms.map((x) => {
                const connected = data?.[x.platform]?.connected || [];
                const account = accounts.find((y) => {
                    return (
                        y.profile.profileSource === x.source &&
                        connected.some((c) => c.id === y.profile.profileId && !!c.connected)
                    );
                });
                return (
                    <ThirdPartItem
                        key={x.source}
                        source={x.source}
                        icon={x.icon}
                        iconWidth={x.iconWidth}
                        iconHeight={x.iconHeight}
                        iconClassName={x.iconClassName}
                        account={account}
                        loading={isLoading}
                        onDisconnected={refetch}
                    />
                );
            })}
        </div>
    );
}
