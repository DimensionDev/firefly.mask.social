import urlcat from 'urlcat';

const handleRequest = (request: Request) => {
    const u = new URL(request.url);

    const newHeaders = new Headers(request.headers);
    if (process.env.HUBBLE_TOKEN) newHeaders.set('api_token', process.env.HUBBLE_TOKEN);

    return fetch(
        new Request(urlcat(process.env.HUBBLE_URL, u.pathname + u.search), {
            ...request,
            headers: newHeaders,
        }),
    );
}

export function GET(request: Request) {
    return handleRequest(request)
}

export function POST(request: Request) {
    return handleRequest(request)
}
