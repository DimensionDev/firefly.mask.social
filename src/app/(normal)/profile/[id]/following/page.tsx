import { FollowingList } from '@/app/(normal)/profile/[id]/following/Pages/FollowingList.js';
import { type SocialSourceInURL } from '@/constants/enum.js';

interface Props {
    params: {
        id: string;
    };
    searchParams: { source: SocialSourceInURL };
}

export default function Following(props: Props) {
    return <FollowingList profileId={props.params.id} source={props.searchParams.source} />;
}
