import { SocialPlatform } from '@/constants/enum.js';
import type { Channel as FireflyChannel } from '@/providers/types/Firefly.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export function formatFarcasterChannelFromFirefly(channel: FireflyChannel): Channel {
    const formatted: Channel = {
        source: SocialPlatform.Farcaster,
        id: channel.id,
        url: channel.url,
        name: channel.name,
        description: channel.description,
        imageUrl: channel.image_url,
        parentUrl: channel.parent_url,
        timestamp: channel.created_at,
        __original__: channel,
    };
    if (channel.lead) {
        formatted.lead = {
            ...channel.lead,
            displayName: channel.lead.display_name,
        };
    }
    return formatted;
}
