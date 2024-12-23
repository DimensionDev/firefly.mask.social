/* eslint-disable @next/next/no-img-element */

import dayjs from 'dayjs';
import { ImageResponse } from 'next/og.js';
import type { NextRequest } from 'next/server.js';
import urlcat from 'urlcat';

import FarcasterSVG from '@/assets/farcaster.svg?url';
import FireflyAvatarSVG from '@/assets/firefly-avatar.svg?url';
import LensSVG from '@/assets/lens.svg?url';
import TwitterSVG from '@/assets/x-circle-light.svg?url';
import { type SocialSource, Source, SourceInURL } from '@/constants/enum.js';
import { CACHE_AGE_INDEFINITE_ON_DISK, SITE_URL } from '@/constants/index.js';
import { compose } from '@/helpers/compose.js';
import { createProxyImageResponse } from '@/helpers/createProxyImageResponse.js';
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

export const GET = compose(
    withRequestErrorHandler({ throwError: true }),
    async (request: NextRequest, context?: NextRequestContext) => {
        const postId = context?.params.postId;
        const source = narrowToSocialSourceInURL(context?.params.source as SourceInURL);
        const provider = resolveSocialMediaProvider(resolveSocialSource(source));
        const post = postId ? await provider.getPostById(postId).catch(() => null) : null;

        if (!post) {
            return createProxyImageResponse(urlcat(SITE_URL, '/image/og.png'));
        }

        const src = resolveAttachmentsSrc(post.metadata.content?.asset);
        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        padding: '130px',
                        backgroundColor: '#F5F5F9',
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
                                <img src={FireflyAvatarSVG} style={{ width: '28px', height: '28px' }} alt="firefly" />
                                <img
                                    src={resolveSourceIcon(post.source)}
                                    style={{ width: '28px', height: '28px' }}
                                    alt="source"
                                />
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
                                    objectFit: 'contain',
                                    marginLeft: 'auto',
                                }}
                            />
                        ) : null}
                    </div>
                </div>
            ),
            {
                width: 1400,
                height: 800,
                headers: {
                    'Cache-Control': CACHE_AGE_INDEFINITE_ON_DISK,
                },
            },
        );
    },
);
