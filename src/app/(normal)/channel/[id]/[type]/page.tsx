import { ChannelContentListPage } from '@/app/(normal)/channel/pages/ChannelContentListPage.js';
import { ChannelTabType } from '@/constants/enum.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';

interface Props {
    params: {
        id: string;
        type: ChannelTabType;
    };
}

export default function Page({ params }: Props) {
    if (isBotRequest()) return null;
    return <ChannelContentListPage type={params.type} />;
}
