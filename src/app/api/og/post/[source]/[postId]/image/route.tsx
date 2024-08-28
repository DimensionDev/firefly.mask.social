import dayjs from 'dayjs';
import { ImageResponse } from 'next/og.js';
import type { NextRequest } from 'next/server.js';
import urlcat from 'urlcat';

import FarcasterSVG from '@/assets/farcaster.svg?url';
import FireflyAvatarSVG from '@/assets/firefly-avatar.svg?url';
import LensSVG from '@/assets/lens.svg?url';
import TwitterSVG from '@/assets/x-circle-light.svg?url';
import { type SocialSource, Source, SourceInURL } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { compose } from '@/helpers/compose.js';
import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { narrowToSocialSourceInURL } from '@/helpers/narrowToSocialSource.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import type { Attachment } from '@/providers/types/SocialMedia.js';
import type { NextRequestContext } from '@/types/index.js';

function resolveSourceIcon(source: SocialSource) {
    return {
        [Source.Farcaster]: FarcasterSVG,
        [Source.Lens]: LensSVG,
        [Source.Twitter]: TwitterSVG,
    }[source];
}

function resolveAttachmentsSrc(asset?: Attachment) {
    if (!asset) return null;
    switch (asset.type) {
        case 'Image':
            return asset.uri;
        case 'Video':
        case 'AnimatedGif':
            return asset.coverUri;
        default:
            return null;
    }
}

export const GET = compose<(request: NextRequest, context: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    async (request, context) => {
        const source = narrowToSocialSourceInURL(context.params.source as SourceInURL);
        const postId = context.params.postId!;
        const provider = resolveSocialMediaProvider(resolveSocialSource(source));
        const post = await provider.getPostById(postId).catch(() => null);

        if (!post) {
            const response = await fetch(urlcat(SITE_URL, '/image/og.png'));
            if (!response.ok) return createErrorResponseJSON('Unable to access the image');
            const headers = new Headers(response.headers);
            const cacheControl = response.headers.get('cache-control');
            headers.set('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
            if (cacheControl) headers.set('Cache-Control', cacheControl);
            return new Response(response.body, { headers });
        }

        const src = resolveAttachmentsSrc(post.metadata.content?.asset);
        const headers = new Headers();
        headers.set('Cache-Control', 'max-age=604800');
        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#F9F9F9',
                        padding: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                        color: '#181818',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '25px',
                        }}
                    >
                        <img
                            src={post.author.pfp}
                            alt="pfp"
                            style={{
                                width: '75px',
                                height: '75px',
                                borderRadius: '100%',
                                objectFit: 'cover',
                            }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div
                                style={{
                                    fontSize: '28px',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                {post.author.displayName}
                                <img src={FireflyAvatarSVG} style={{ width: '28px', height: '28px' }} />
                                <img src={resolveSourceIcon(post.source)} style={{ width: '28px', height: '28px' }} />
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 400, color: '#767676' }}>
                                {`@${post.author.handle} · ${dayjs(post.timestamp).format('hh:mm A · MMM D YYYY')}`}
                            </div>
                        </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 400, display: 'flex', gap: '30px', marginTop: '10px' }}>
                        <div
                            style={{
                                whiteSpace: 'pre-line',
                                wordWrap: 'break-word',
                                height: '455px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {post.metadata.content?.content}
                        </div>
                        {src ? (
                            <img
                                src={src}
                                alt="image"
                                style={{
                                    borderRadius: '16px',
                                    width: '556px',
                                    height: '455px',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : null}
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 600,
                headers,
            },
        );
    },
);
