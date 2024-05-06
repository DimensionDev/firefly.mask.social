import { FollowersList } from '@/app/(normal)/profile/[id]/followers/Pages/FollowersList.js';
import { type SourceInURL } from '@/constants/enum.js';

interface Props {
    params: {
        id: string;
    };
    searchParams: { source: SourceInURL };
}

export default function Followers(props: Props) {
    return <FollowersList profileId={props.params.id} source={props.searchParams.source} />;
}
