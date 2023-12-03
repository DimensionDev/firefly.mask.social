import { useQuery } from '@tanstack/react-query';
import { redirect } from 'next/navigation.js';
import { useMemo } from 'react';
import { useDocumentTitle } from 'usehooks-ts';

import ContentTabs from '@/app/profile/components/ContentTabs.js';
import EmptyProfile from '@/app/profile/components/EmptyProfile.js';
import Info from '@/app/profile/components/Info.js';
import Title from '@/app/profile/components/Title.js';
import Loading from '@/components/Loading.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { useLogin } from '@/hooks/useLogin.js';
import { usePlatformAccount } from '@/hooks/usePlatformAccount.js';
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

    if (!profile) redirect('/');

    const isLogin = useLogin();

    const platformAccount = usePlatformAccount();

    const isMyProfile = useMemo(
        () => !!isLogin && platformAccount.farcaster.id === id,
        [id, isLogin, platformAccount.farcaster.id],
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
        return <EmptyProfile />;
    }

    return (
        <div>
            {!isMyProfile ? <Title profile={profile} isMyProfile={isMyProfile} /> : null}

            <Info profile={profile} isMyProfile={isMyProfile} />

            <ContentTabs />
        </div>
    );
}
