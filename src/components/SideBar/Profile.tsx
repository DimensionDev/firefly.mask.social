'use client';

import { Trans } from '@lingui/macro';
import { usePathname } from 'next/navigation.js';

import ProfileSelectedIcon from '@/assets/profile.selected.svg';
import ProfileIcon from '@/assets/profile.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { PageRoute } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import { parseProfileUrl } from '@/helpers/parseProfileUrl.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { useCurrentProfileFirstAvailable } from '@/hooks/useCurrentProfile.js';

interface ProfileProps {
    collapsed?: boolean;
}

export function Profile({ collapsed: sideBarCollapsed = false }: ProfileProps) {
    const profile = useCurrentProfileFirstAvailable();
    const profiles = useCurrentFireflyProfilesAll();

    const href = profile ? getProfileUrl(profile) : PageRoute.Profile;
    const pathname = usePathname();
    const parsedProfileUrl = parseProfileUrl(pathname);
    const isSelected = parsedProfileUrl
        ? profiles.some((x) =>
              isSameFireflyIdentity(x.identity, {
                  source: parsedProfileUrl.source,
                  id: parsedProfileUrl.id,
              }),
          )
        : false;

    const Icon = isSelected ? ProfileSelectedIcon : ProfileIcon;

    return (
        <Link
            href={href}
            className={classNames(
                'flex w-full flex-grow-0 items-center gap-x-3 rounded-lg px-2 py-2 text-lg leading-6 outline-none hover:bg-bg md:w-auto md:px-4',
                { 'font-bold': isSelected },
            )}
        >
            {sideBarCollapsed ? (
                <Tooltip content={<Trans>Profile</Trans>} placement="right">
                    <Icon width={20} height={20} />
                </Tooltip>
            ) : (
                <Icon width={20} height={20} />
            )}
            <span style={{ display: sideBarCollapsed ? 'none' : 'inline' }}>
                <Trans>Profile</Trans>
            </span>
        </Link>
    );
}
