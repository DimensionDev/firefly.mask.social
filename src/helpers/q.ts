export const q = (s: string) => document.querySelector(`meta[name="${s}"]`) || document.querySelector(`meta[property="${s}"]`);

export const qs = (s: string) =>
    document.querySelector(`meta[name^="${s}"]`) || document.querySelector(`meta[property^="${q}"]`);
