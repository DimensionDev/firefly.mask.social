import type { CommunityUrl } from '@/providers/types/Trending.js';

export function getCommunityLink(links: string[]): CommunityUrl[] {
    return links.map((x) => {
        const host = new URL(x).host;
        if (host === 'twitter.com' || host === 'x.com') return { type: 'twitter', link: x };
        if (host === 't.me' || host === 'telegram.org') return { type: 'telegram', link: x };
        if (host === 'facebook.com' || host === 'www.facebook.com') return { type: 'facebook', link: x };
        if (host === 'discord.com' || host === 'discord.gg' || host === 'discord.io')
            return { type: 'discord', link: x };
        if (host === 'www.reddit.com') return { type: 'reddit', link: x };
        if (host === 'www.youtube.com') return { type: 'youtube', link: x };
        if (host === 'medium.com') return { type: 'medium', link: x };
        if (host === 'www.instagram.com') return { type: 'instagram', link: x };
        if (host === 'www.linkedin.com') return { type: 'linkedin', link: x };
        return { type: 'other', link: x };
    });
}
