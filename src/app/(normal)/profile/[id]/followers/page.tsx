import { FollowersList } from '@/app/(normal)/profile/[id]/followers/Pages/FollowersList.js';
import { type SocialSourceInURL } from '@/constants/enum.js';

interface Props {
    params: {
        id: string;
    };
    searchParams: { source: SocialSourceInURL };
}

export default function Followers(props: Props) {
    return <FollowersList profileId={props.params.id} source={props.searchParams.source} />;
}
