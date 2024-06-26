import type { CommunityUrls } from '@/providers/types/Trending.js';

export function getCommunityLink(links: string[]): CommunityUrls {
    return links.map((x) => {
        if (x.includes('twitter')) return { type: 'twitter', link: x };
        if (x.includes('t.me')) return { type: 'telegram', link: x };
        if (x.includes('facebook')) return { type: 'facebook', link: x };
        if (x.includes('discord')) return { type: 'discord', link: x };
        if (x.includes('reddit')) return { type: 'reddit', link: x };
        return { type: 'other', link: x };
    });
}
