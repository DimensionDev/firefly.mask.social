'use client';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';
import { Suspense, useMemo, use } from 'react';

import { Loading } from '@/components/Loading.js';
import { LoginRequiredGuard } from '@/components/LoginRequiredGuard.js';
import { ProfilePageTimeline } from '@/components/Profile/ProfilePageTimeline.js';
import { type ProfileCategory, Source, SourceInURL } from '@/constants/enum.js';
import { isProfilePageSource } from '@/helpers/isProfilePageSource.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { getProfileById } from '@/services/getProfileById.js';

interface Props {
    params: Promise<{
        id: string;
        category: ProfileCategory;
        source: SourceInURL;
    }>;
}

const REQUIRE_LOGIN_SOURCES = [Source.Twitter];

export default function Page(props: Props) {
    const params = use(props.params);
    const source = resolveSourceFromUrl(params.source);
    if (!isProfilePageSource(source)) notFound();

    // Lens used handle in profile page, while timeline can only be queried using profileId, it is necessary to convert handle to profileId.
    const { data: profile = null } = useQuery({
        queryKey: ['profile', source, params.id],
        queryFn: async () => {
            if (source === Source.Wallet) return null;
            return getProfileById(source, params.id);
        },
    });

    const identity = useMemo(
        () => ({ id: profile?.profileId ?? params.id, source }),
        [profile?.profileId, params.id, source],
    );

    const content = (
        <Suspense fallback={<Loading />}>
            <ProfilePageTimeline category={params.category} identity={identity} />
        </Suspense>
    );

    if (REQUIRE_LOGIN_SOURCES.includes(source)) {
        return (
            <LoginRequiredGuard source={source} className="md:!pt-0">
                {content}
            </LoginRequiredGuard>
        );
    }

    return content;
}
