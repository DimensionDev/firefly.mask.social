'use client';

import { Image } from '@/esm/Image.js';
import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { FireflySocialMedia } from '@/providers/firefly/SocialMedia.js';

interface LoginFarcasterProps {
    closeFarcaster: () => void;
}

export function LoginFarcaster({ closeFarcaster }: LoginFarcasterProps) {
    const [url, setUrl] = useState('');

    async function login() {
        const fireflyProvider = new FireflySocialMedia();
        // await fireflyProvider.createSessionByGrantPermission(setUrl);
        fireflyProvider.publishPost({ metadata: { content: 'hhhhhhhhhhh' } });
    }

    useEffect(() => {
        login();
    }, []);

    return (
        <div
            className="flex w-[600px] flex-col rounded-[12px]"
            style={{ boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)' }}
        >
            <div className="inline-flex h-[56px] w-full items-center justify-center gap-2 rounded-t-[12px] bg-gradient-to-b from-white to-white p-4">
                <button
                    onClick={() => {
                        closeFarcaster();
                    }}
                >
                    <Image
                        className="relative h-[24px] w-[24px]"
                        src="/svg/leftArrow.svg"
                        alt="close"
                        width={24}
                        height={24}
                    />
                </button>
                <div className="shrink grow basis-0 text-center font-['Helvetica'] text-lg font-bold leading-snug text-slate-950">
                    Log in with Farcaster account
                </div>
                <div className="relative h-[24px] w-[24px]" />
            </div>
            <div className="flex min-h-[475px] w-full flex-col items-center gap-[16px] p-[16px] ">
                <div className=" text-center text-[12px] leading-[16px] text-lightSecond">
                    Log in to your Farcaster account by scanning this QR code using mobile application Warpcast.
                </div>
                {url ? <QRCode value={url} size={330} /> : null}
            </div>
        </div>
    );
}
