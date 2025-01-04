import { ChannelContentListPage } from '@/app/(normal)/channel/pages/ChannelContentListPage.js';
import { ChannelTabType } from '@/constants/enum.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';

interface Props {
    params: Promise<{
        id: string;
        type: ChannelTabType;
    }>;
}

export default async function Page(props: Props) {
    const params = await props.params;
    if (await isBotRequest()) return null;
    return <ChannelContentListPage type={params.type} />;
}
