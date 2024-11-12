export class JWTGenerator {
    private async base64UrlEncode(input: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        return this.wordsToBase64Url(new Uint8Array(data));
    }

    private async wordsToBase64Url(words: Uint8Array): Promise<string> {
        const base64String = btoa(String.fromCharCode(...words));
        return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/[=]+$/, '');
    }

    public async generateSHA256JWT(payload: Record<string, any>, secretKey: string): Promise<string> {
        const header = {
            alg: 'HS256',
            typ: 'JWT',
        };
        const encodedHeader = await this.base64UrlEncode(JSON.stringify(header));
        const encodedPayload = await this.base64UrlEncode(JSON.stringify(payload));

        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            enc.encode(secretKey),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign'],
        );

        const signature = await crypto.subtle.sign('HMAC', key, enc.encode(`${encodedHeader}.${encodedPayload}`));

        const signatureArray = new Uint8Array(signature);
        const base64urlSignature = await this.wordsToBase64Url(signatureArray);

        return `${encodedHeader}.${encodedPayload}.${base64urlSignature}`;
    }
}
