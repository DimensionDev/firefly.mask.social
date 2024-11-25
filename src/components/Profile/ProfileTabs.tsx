'use client';

import { startTransition } from 'react';

import FireflyLogo from '@/assets/firefly.round.svg';
import { SourceTabs } from '@/components/SourceTabs/index.js';
import { SquareSourceIcon } from '@/components/SquareSourceIcon.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { isMPCWallet } from '@/helpers/isMPCWallet.js';
import { isProfilePageSource } from '@/helpers/isProfilePageSource.js';
import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { useIsDarkMode } from '@/hooks/useIsDarkMode.js';
import { type FireflyIdentity, type FireflyProfile, type WalletProfile } from '@/providers/types/Firefly.js';
import { useFireflyIdentityState } from '@/store/useFireflyIdentityStore.js';

const resolveProfileTabColor = createLookupTableResolver<
    Source,
    {
        background?: string;
        darkBackground?: string;
        color?: string;
        darkColor?: string;
        activeBackground?: string;
        activeColor?: string;
        borderColor?: string;
    }
>(
    {
        [Source.Lens]: {
            background: 'rgba(171, 254, 44, 0.2)',
            darkBackground: 'rgba(171, 254, 44, 0.3)',
            color: '#00501E',
            darkColor: '#ffffff',
            activeColor: '#00501E',
            activeBackground: '#ABFE2C',
            borderColor: '#00501E',
        },
        [Source.Farcaster]: {
            background: 'rgba(133, 93, 205, 0.12)',
            darkBackground: 'rgba(133, 93, 205, 0.3)',
            color: '#855DCD',
            darkColor: '#ffffff',
            activeColor: '#ffffff',
            activeBackground: '#855DCD',
            borderColor: '#ffffff',
        },
        [Source.Twitter]: {},
        [Source.Firefly]: {},
        [Source.Article]: {},
        [Source.Wallet]: {},
        [Source.NFTs]: {},
        [Source.Snapshot]: {},
        [Source.Polymarket]: {},
        [Source.Apple]: {},
        [Source.Google]: {},
        [Source.Telegram]: {},
    },
    {},
);

interface ProfileTabsProps {
    profiles: FireflyProfile[];
    identity: FireflyIdentity;
}

export function ProfileTabs({ profiles: otherProfiles, identity }: ProfileTabsProps) {
    const isDarkMode = useIsDarkMode();
    const currentProfiles = useCurrentFireflyProfilesAll();
    const isCurrentProfile = currentProfiles.some((x) => isSameFireflyIdentity(x.identity, identity));

    const profiles = (isCurrentProfile ? currentProfiles : otherProfiles).filter(
        (x) => x.identity.source === identity.source,
    );

    if (profiles.length <= 1) return null;

    return (
        <SourceTabs className="!static !z-0 !border-none !bg-transparent">
            {profiles.map((profile, index) => {
                const colors = resolveProfileTabColor(profile.identity.source);
                const isActive = isSameFireflyIdentity(profile.identity, identity);

                const isWalletProfile = profile.identity.source === Source.Wallet;
                const isMPC = isWalletProfile && isMPCWallet(profile.__origin__ as WalletProfile);

                if (!isProfilePageSource(profile.identity.source)) return null;

                return (
                    <Link
                        href={resolveProfileUrl(profile.identity.source, profile.identity.id)}
                        onClick={() =>
                            startTransition(() => {
                                useFireflyIdentityState.getState().setIdentity(profile.identity);
                            })
                        }
                        className={classNames(
                            'flex cursor-pointer items-center gap-1 rounded-lg p-1 px-2 active:bg-main/20',
                            isActive ? 'border border-primaryBottom bg-main text-primaryBottom' : 'bg-thirdMain',
                        )}
                        style={{
                            background: isActive
                                ? colors.activeBackground
                                : isDarkMode
                                  ? colors.darkBackground
                                  : colors.background,
                            color: isActive ? colors.activeColor : isDarkMode ? colors.darkColor : colors.color,
                        }}
                        key={index}
                        ref={(node) => {
                            if (isActive && node) node.scrollIntoView();
                        }}
                    >
                        {isMPC ? (
                            <FireflyLogo width={14} height={14} />
                        ) : (
                            <SquareSourceIcon
                                source={profile.identity.source}
                                size={14}
                                forceLight={isActive}
                                className="rounded-[4px]"
                                style={{
                                    border:
                                        isActive && colors.borderColor ? `1px solid ${colors.borderColor}` : undefined,
                                }}
                            />
                        )}
                        <span className="whitespace-nowrap text-[10px] leading-3">
                            {`${isWalletProfile ? '' : '@'}${profile.displayName}`}
                        </span>
                    </Link>
                );
            })}
        </SourceTabs>
    );
}
