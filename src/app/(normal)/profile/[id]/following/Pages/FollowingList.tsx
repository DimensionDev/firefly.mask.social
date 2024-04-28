'use client'

import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';

import ComeBack from '@/assets/comeback.svg';
import { SourceInURL } from '@/constants/enum.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';
import { useComeBack } from '@/hooks/useComeback.js';
import { getFollowings } from '@/services/getFollowings.js';

export function FollowingList({ profileId, source }: { profileId: string, source: SourceInURL }) {
    const comeback = useComeBack();
    const { data } = useQuery({
        queryKey: ['following', source, profileId, ],
        queryFn: () => getFollowings(resolveSocialPlatform(source), profileId),
    })

    console.log(data)

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-40 flex items-center bg-primaryBottom px-4 py-[18px]">
                <ComeBack width={24} height={24} className="mr-8 cursor-pointer" onClick={comeback} />
                <h2 className="text-xl font-black leading-6">
                    <Trans>Following</Trans> {profileId}
                </h2>
            </div>
        </div>
    )
}
