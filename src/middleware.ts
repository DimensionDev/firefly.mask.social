import { NextRequest, NextResponse, userAgent } from 'next/server.js';
import urlcat from 'urlcat';

import { OLD_MASK_SOCIAL_POST_PATH_REGEX, OLD_MASK_SOCIAL_PROFILE_PATH_REGEX } from '@/constants/regex.js';

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    const isPost = pathname.startsWith('/post') && !pathname.includes('/photos');
    const isProfile = pathname.startsWith('/profile') // && !pathname.endsWith('/following') && !pathname.endsWith('/followers');
    const isFollowing = pathname.startsWith('/profile') && pathname.endsWith('/following');
    const isFollowers = pathname.startsWith('/profile') && pathname.endsWith('/followers');

    if (isFollowing || isFollowers) {
        return NextResponse.next({
            request,
        });
    }

    if (isPost || isProfile) {
        const { isBot } = userAgent(request);

        request.headers.set('X-IS-BOT', isBot ? 'true' : 'false');

        if (
            OLD_MASK_SOCIAL_POST_PATH_REGEX.test(request.nextUrl.pathname) ||
            OLD_MASK_SOCIAL_PROFILE_PATH_REGEX.test(request.nextUrl.pathname)
        ) {
            const match = request.nextUrl.pathname.match(
                isPost ? OLD_MASK_SOCIAL_POST_PATH_REGEX : OLD_MASK_SOCIAL_PROFILE_PATH_REGEX,
            );
            const source = match ? match[1] : null;
            const id = match ? match[2] : null;
            console.log({
                match,
                source,
                id,
            })
            if (!id || !source)
                return NextResponse.next({
                    request,
                });

            if (isPost) return NextResponse.redirect(urlcat(request.nextUrl.origin, `/post/:id`, { source, id }));
            if (isProfile) return NextResponse.redirect(urlcat(request.nextUrl.origin, `/profile/:id`, { source, id }));
        }
        return NextResponse.next({
            request,
        });
    }

    return NextResponse.next({
        request,
    });
}

export const config = {
    matcher: ['/post/:path*', '/profile/:path*'],
};
