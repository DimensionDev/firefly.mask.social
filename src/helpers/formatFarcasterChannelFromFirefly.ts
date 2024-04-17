import type { Channel as FireflyChannel } from '@/providers/types/Firefly.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export function formatFarcasterChannelFromFirefly(channel: FireflyChannel): Channel {
    return {
        ...channel,
        lead: {
            ...channel.lead,
            displayName: channel.lead.display_name,
        },
        imageUrl: channel.image_url,
        parentUrl: channel.parent_url,
        timestamp: channel.created_at,
    };
}
