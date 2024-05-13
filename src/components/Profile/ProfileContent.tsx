import { usePathname } from 'next/navigation.js';
import { useMemo } from 'react';

import { Loading } from '@/components/Loading.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { Info } from '@/components/Profile/Info.js';
import { ProfileContentTabs } from '@/components/Profile/ProfileContentTabs.js';
import { ProfileTabs } from '@/components/Profile/ProfileTabs.js';
import { WalletInfo } from '@/components/Profile/WalletInfo.js';
import { WalletTabs } from '@/components/Profile/WalletTabs.js';
import { PageRoute, Source } from '@/constants/enum.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import type { FireFlyProfile, Relation, WalletProfile } from '@/providers/types/Firefly.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useTwitterStateStore } from '@/store/useProfileStore.js';

interface ProfileContentProps {
    loading: boolean;
    source: Source;
    walletProfile?: WalletProfile;
    profile?: Profile | null;
    profiles: FireFlyProfile[];
    relations?: Relation[];
}

export function ProfileContent({ loading, source, walletProfile, profile, profiles, relations }: ProfileContentProps) {
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();

    const pathname = usePathname();
    const isProfilePage = pathname === PageRoute.Profile;

    const info = useMemo(() => {
        if (source === Source.Wallet && walletProfile) {
            return <WalletInfo profile={walletProfile} relations={relations} />;
        }
        if (profile) {
            return <Info profile={profile} />;
        }

        return null;
    }, [profile, walletProfile, source, relations]);

    if (loading) return <Loading />;

    if (source === Source.Twitter && !currentTwitterProfile?.profileId) {
        return <NotLoginFallback source={Source.Twitter} />;
    }

    if (isProfilePage && !profile && source !== Source.Wallet) {
        return <NotLoginFallback source={narrowToSocialSource(source)} />;
    }

    return (
        <>
            {info}
            <ProfileTabs profiles={profiles.filter((x) => x.source === source)} />

            {walletProfile ? (
                <WalletTabs address={walletProfile.address} />
            ) : profile ? (
                <ProfileContentTabs source={profile.source} profileId={profile.profileId} />
            ) : null}
        </>
    );
}
