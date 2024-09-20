import { parseHTML } from 'linkedom';
import { first } from 'lodash-es';

import type { ParagraphJSONContent } from '@/providers/paragraph/type.js';

export function parseParagraphHtml(htmlString: string, jsonString: string) {
    if (!htmlString || !jsonString) return;

    const { document } = parseHTML(htmlString);

    const json = JSON.parse(jsonString) as { content: ParagraphJSONContent[] };

    const twitterEmbeds = json.content.filter((x) => x.type === 'twitter');

    twitterEmbeds.forEach((x) => {
        const poster = x.attrs?.tweetData?.video?.poster;
        if (!poster) return;
        const videoSrc = first(x.attrs?.tweetData?.video?.variants.filter((video) => video.type === 'video/mp4'))?.src;
        const img = document.querySelector(`img[src="${poster}"]`);

        if (!img || !videoSrc) return;

        const videoNode = document.createElement('video');
        videoNode.setAttribute('src', videoSrc);
        videoNode.setAttribute('controls', 'true');

        img?.replaceWith(videoNode);
    });

    const svgEmbeds = json.content.filter((x) => x.type === 'figure');

    svgEmbeds.forEach((x) => {
        x.content.forEach((svg) => {
            if (svg.attrs?.nextheight && svg.attrs?.nextwidth) {
                const node = document.querySelector(`img[src="${svg.attrs.src}"]`);
                node?.setAttribute('height', `${svg.attrs.nextheight}px`);
                node?.setAttribute('width', `${svg.attrs.nextwidth}px`);
            }

            return;
        });
    });

    console.log(document);
    return document.toString();
}
