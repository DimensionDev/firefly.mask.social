import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

/**
 * We use ffmpeg wasm here to transcode in the browser.
 * And dynamically load the ffmpeg wasm and core js files from the unpkg CDN.
 */
export async function loadFfmpeg() {
    if (ffmpeg) return ffmpeg;
    ffmpeg = new FFmpeg();

    ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]: ', message);
    });
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    return ffmpeg;
}
