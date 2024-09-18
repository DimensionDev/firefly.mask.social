'use client';

import { SORTED_PROFILE_SOURCES } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import type { FireflyIdentity, FireflyProfile } from '@/providers/types/Firefly.js';

interface ProfileSourceTabs {
    profiles: FireflyProfile[];
    identity: FireflyIdentity;
}

export function ProfileSourceTabs({ profiles, identity }: ProfileSourceTabs) {
    return (
        <div className="no-scrollbar w-full overflow-x-auto overflow-y-hidden border-b border-line bg-primaryBottom px-4 md:top-0">
            <nav className="flex space-x-4 text-xl" aria-label="Tabs">
                {SORTED_PROFILE_SOURCES.map((value) => {
                    const profile = profiles.find((profile) => profile.identity.source === value);
                    if (!profile) return null;
                    return (
                        <Link
                            key={value}
                            href={resolveProfileUrl(value, profile.identity.id)}
                            className={classNames(
                                'h-[43px] cursor-pointer border-b-2 px-4 text-center font-bold leading-[43px] hover:text-main md:h-[60px] md:py-[18px] md:leading-6',
                                value === identity.source
                                    ? 'border-farcasterPrimary text-main'
                                    : 'border-transparent text-third',
                            )}
                            aria-current={value === identity.source ? 'page' : undefined}
                        >
                            {resolveSourceName(value)}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
