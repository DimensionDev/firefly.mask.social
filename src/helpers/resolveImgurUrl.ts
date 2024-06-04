export function resolveImgurUrl(url: string | undefined) {
    if (!url) return url;
    if (!URL.canParse(url)) return url;

    const u = new URL(url);
    if (u.protocol !== 'https:') return url;
    if (u.host !== 'i.imgur.com') return url;

    return `https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_jpg,w_144/${encodeURIComponent(url)}`;
}
