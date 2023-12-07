import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useDocumentTitle } from 'usehooks-ts';

import Loading from '@/components/Loading.js';
import NotFoundFallback from '@/components/NotFoundFallback.js';
import ContentTabs from '@/components/Profile/ContentTabs.js';
import Info from '@/components/Profile/Info.js';
import Title from '@/components/Profile/Title.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { usePlatformProfile } from '@/hooks/usePlatformProfile.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';

interface LensProfileProps {
    handle: string;
}
export default function LensProfile({ handle }: LensProfileProps) {
    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile', handle],
        queryFn: () => LensSocialMediaProvider.getProfileByHandle(`lens/${handle}`),
    });

    const isLogin = useIsLogin();

    const platformAccount = usePlatformProfile();

    const isMyProfile = useMemo(
        () => !!isLogin && platformAccount.lens?.handle === handle,
        [handle, isLogin, platformAccount.lens?.handle],
    );

    const title = useMemo(() => {
        if (!profile) return '';
        const fragments = [profile.displayName];
        if (profile.handle) fragments.push(`(@${profile.handle})`);
        return createPageTitle(fragments.join(' '));
    }, [profile]);

    useDocumentTitle(title);

    if (isLoading) {
        return <Loading />;
    }

    if (!profile) {
        return <NotFoundFallback type="profile" />;
    }

    return (
        <div>
            {!isMyProfile ? <Title profile={profile} isMyProfile={isMyProfile} /> : null}

            <Info profile={profile} isMyProfile={isMyProfile} />

            <ContentTabs />
        </div>
    );
}
