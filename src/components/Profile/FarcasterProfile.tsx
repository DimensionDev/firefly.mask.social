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
import { WarpcastSocialMedia } from '@/providers/warpcast/SocialMedia.js';

interface FarcasterProfileProps {
    id: string;
}
export default function FarcasterProfile({ id }: FarcasterProfileProps) {
    const farcasterClient = new WarpcastSocialMedia();
    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile', id],
        queryFn: () => farcasterClient.getProfileById(id),
    });

    const isLogin = useIsLogin();

    const platformProfile = usePlatformProfile();

    const isMyProfile = useMemo(
        () => !!isLogin && platformProfile.farcaster?.profileId === id,
        [id, isLogin, platformProfile.farcaster?.profileId],
    );

    const title = useMemo(() => {
        if (!profile) return '';
        const fragments = [profile.displayName];
        if (profile.profileId) fragments.push(`(@${profile.profileId})`);
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
