import { v4 as uuid } from 'uuid';

import { FileMimeType, SourceInURL } from '@/constants/enum.js';
import { loadFfmpeg } from '@/helpers/ffmpeg.js';
import { generateVideoCover } from '@/helpers/generateVideoCover.js';
import { uploadToDirectory } from '@/services/uploadToS3.js';

const videoQualities = [
    {
        name: '480p',
        resolution: '842x480',
        bandwidth: 1400000,
        args: ['-b:v', '1400k', '-maxrate', '1498k', '-bufsize', '2100k'],
    },
    {
        name: '720p',
        resolution: '1280x720',
        bandwidth: 2800000,
        args: ['-b:v', '2800k', '-maxrate', '2996k', '-bufsize', '4200k'],
    },
];

function generateM3u8File() {
    let m3u8 = '#EXTM3U\n#EXT-X-VERSION:3';

    videoQualities.forEach((quality) => {
        m3u8 += `\n#EXT-X-STREAM-INF:BANDWIDTH=${quality.bandwidth},RESOLUTION=${quality.resolution}\n${quality.name}.m3u8`;
    });

    return new File([m3u8], 'index.m3u8', { type: 'application/x-mpegURL' });
}

async function uploadVideoPoster(file: File, s3Directory: string) {
    const covers = await generateVideoCover(file, 4);
    return covers.length
        ? await uploadToDirectory(
              new File([covers[1] ?? covers[0]], 'thumbnail.jpg', { type: FileMimeType.JPEG }),
              s3Directory,
              () => 'thumbnail.jpg',
          )
        : '';
}

async function uploadWithQuality(
    file: File,
    uniqueId: string,
    s3Directory: string,
    quality: (typeof videoQualities)[number],
) {
    const ffmpeg = await loadFfmpeg();

    const outputPath = `${quality.name}.m3u8`;
    const segmentPath = `${uniqueId}/${quality.name}_%03d.ts`;
    const segmentList = `${quality.name}_${uniqueId}.m3u8`;

    await ffmpeg.createDir(uniqueId);

    // slice video into 10s segments
    await ffmpeg.exec([
        '-i',
        file.name,
        '-c',
        'copy',
        '-bsf:v',
        'h264_mp4toannexb',
        ...quality.args,
        '-f',
        'segment',
        '-segment_time',
        '10',
        '-segment_list',
        segmentList,
        '-segment_format',
        'mpegts',
        segmentPath,
    ]);

    // upload the segments to S3
    const segmentNodes = (await ffmpeg.listDir(uniqueId)).filter((node) => !node.isDir);
    const tsUrls = await Promise.all(
        segmentNodes.map(async (node) => {
            const segment = await ffmpeg.readFile(`${uniqueId}/${node.name}`);
            const segmentFile = new File([segment], node.name, { type: 'video/mp2t' });
            return uploadToDirectory(segmentFile, s3Directory, () => node.name);
        }),
    );

    // upload m3u8 file to S3
    const m3u8 = await ffmpeg.readFile(segmentList);
    const m3u8File = new File([m3u8], outputPath, { type: 'application/x-mpegURL' });
    const m3u8Url = await uploadToDirectory(m3u8File, s3Directory, () => outputPath);

    // clean up
    await Promise.all(segmentNodes.map((node) => ffmpeg.deleteFile(`${uniqueId}/${node.name}`)));
    await ffmpeg.deleteDir(uniqueId);

    return { tsUrls, m3u8Url };
}

export async function uploadM3u8ToS3(file: File, source: SourceInURL) {
    const ffmpeg = await loadFfmpeg();
    const uniqueId = uuid();
    const s3Directory = `m3u8/${source}/${uniqueId}`;

    // write video file to buffer
    await ffmpeg.writeFile(file.name, new Uint8Array(await file.arrayBuffer()));

    // upload video with different qualities to S3
    // handle step by step to avoid memory leak
    await uploadWithQuality(file, uniqueId, s3Directory, videoQualities[0]);
    await uploadWithQuality(file, uniqueId, s3Directory, videoQualities[1]);

    // generate m3u8 file
    const m3u8File = generateM3u8File();
    const m3u8Url = await uploadToDirectory(m3u8File, s3Directory, () => m3u8File.name);

    // upload poster image to S3
    await uploadVideoPoster(file, s3Directory);

    return m3u8Url;
}
