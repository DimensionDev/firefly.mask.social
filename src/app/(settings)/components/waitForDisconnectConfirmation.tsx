import { t, Trans } from '@lingui/macro';

import { WalletItem } from '@/app/(settings)/components/WalletItem.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { FireflyPlatform, Source } from '@/constants/enum.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';
import { getProfilesByIds } from '@/services/getProfilesByIds.js';

async function getRelatedProfiles({ identities }: FireflyWalletConnection) {
    if (!identities.length) return [];
    const lensIds = identities.filter((x) => x.source === Source.Lens).map((x) => x.id);
    const farcasterIds = identities.filter((x) => x.source === Source.Farcaster).map((x) => x.id);
    return [
        ...(lensIds.length ? await getProfilesByIds(FireflyPlatform.Lens, lensIds) : []),
        ...(farcasterIds ? await getProfilesByIds(FireflyPlatform.Farcaster, farcasterIds) : []),
    ];
}

export async function waitForDisconnectConfirmation(connection: FireflyWalletConnection) {
    const profiles = await getRelatedProfiles(connection);

    return await ConfirmModalRef.openAndWaitForClose({
        title: t`Disconnect`,
        content: (
            <div className="-mt-4 mb-1">
                <p className="mb-3 text-[13px] text-lightMain">
                    {profiles.length ? (
                        <Trans>
                            Confirm to disconnect this wallet and related accounts from Firefly’s social graph?
                        </Trans>
                    ) : (
                        <Trans>Confirm to disconnect this wallet from Firefly’s social graph?</Trans>
                    )}
                </p>
                <WalletItem connection={connection} noAction />
                <div className="no-scrollbar max-h-[calc(63px_*_3)] overflow-y-auto">
                    {profiles.map((profile) => (
                        <div
                            key={profile.profileId}
                            className="mb-3 inline-flex h-[63px] w-full items-center justify-start gap-3 rounded-lg bg-white bg-bottom px-3 py-2 dark:bg-bg"
                            style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
                        >
                            <ProfileAvatar profile={profile} size={36} />
                            <ProfileName profile={profile} />
                        </div>
                    ))}
                </div>
            </div>
        ),
    });
}
