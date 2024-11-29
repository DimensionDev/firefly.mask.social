import urlcat from 'urlcat';

import { ChannelTabType, type SocialSource, Source } from '@/constants/enum.js';
import { resolveSocialSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

export function resolveChannelUrl(id: string, type: ChannelTabType = ChannelTabType.Recent, source?: SocialSource) {
    return urlcat(`/channel/:source/:id/:type`, {
        id,
        type,
        source: resolveSocialSourceInUrl(source ?? Source.Farcaster),
    });
}
