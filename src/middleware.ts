import { NextRequest, NextResponse, userAgent } from 'next/server.js';
import urlcat from 'urlcat';

import { isFollowCategory } from '@/helpers/isFollowCategory.js';
import { isMatchedDiscoverPage } from '@/helpers/isMatchedDiscoverPage.js';
import { parseOldEngagementUrl } from '@/helpers/parseEngagementUrl.js';
import { parseOldProfileUrl } from '@/helpers/parseProfileUrl.js';
import { parseOldPostUrl } from '@/helpers/parsePostUrl.js';
import { parseProfileUrl } from '@/helpers/parseProfileUrl.js';
import { resolveEngagementUrl } from '@/helpers/resolveEngagementUrl.js';
import { resolvePostUrl } from '@/helpers/resolvePostUrl.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    request.headers.set('X-URL', request.url);

    if (isMatchedDiscoverPage(pathname)) {
        return NextResponse.rewrite(new URL(`/discover${pathname}`, request.url), {
            request,
        });
    }

    const parsedOldProfileUrl = parseOldProfileUrl(request.nextUrl);
    if (parsedOldProfileUrl) {
        const destination = request.nextUrl.clone();
        destination.pathname = resolveProfileUrl(parsedOldProfileUrl.source, parsedOldProfileUrl.id);
        destination.searchParams.delete('source');
        return NextResponse.redirect(destination);
    }

    const parsedProfileUrl = parseProfileUrl(pathname);
    if (parsedProfileUrl?.category && isFollowCategory(parsedProfileUrl.category)) {
        const destination = new URL(
            urlcat(`/profile/:source/:id/relation/:category`, {
                ...parsedProfileUrl,
                source: resolveSourceInUrl(parsedProfileUrl.source),
            }),
            request.url,
        );
        return NextResponse.rewrite(destination, {
            request,
        });
    }

    const parsedOldEngagementUrl = parseOldEngagementUrl(request.nextUrl);
    if (parsedOldEngagementUrl) {
        const destination = request.nextUrl.clone();
        destination.pathname = resolveEngagementUrl(
            parsedOldEngagementUrl.id,
            parsedOldEngagementUrl.source,
            parsedOldEngagementUrl.engagement,
        );
        destination.searchParams.delete('source');
        return NextResponse.redirect(destination);
    }

    const parsedOldPostUrl = parseOldPostUrl(request.nextUrl);
    if (parsedOldPostUrl) {
        const destination = request.nextUrl.clone();
        destination.pathname = resolvePostUrl(parsedOldPostUrl.source, parsedOldPostUrl.id);
        destination.searchParams.delete('source');
        return NextResponse.redirect(destination);
    }

    const isPost = pathname.startsWith('/post') && !pathname.includes('/photos');
    if (isPost) {
        const { isBot } = userAgent(request);

        request.headers.set('X-IS-BOT', isBot ? 'true' : 'false');

        return NextResponse.next({
            request,
        });
    }

    return NextResponse.next({
        request,
    });
}

export const config = {
    matcher: [
        '/((?!_next/static|js|sw.js|site.webmanifest|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js)$).*)',
    ],
};
