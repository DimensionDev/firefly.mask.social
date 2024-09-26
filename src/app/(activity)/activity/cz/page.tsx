import { CZActivityHomePage } from '@/components/ActivityPage/CZ/CZActivityHomePage.js';
import { Image } from '@/esm/Image.js';

export default function Page() {
    return (
        <>
            <Image
                src="/image/activity/cz/background.webp"
                alt="background"
                width={1500}
                height={1000}
                className="pointer-events-none fixed left-0 top-0 h-full w-full object-cover"
            />
            <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[600px] flex-col text-white">
                <CZActivityHomePage />
            </div>
        </>
    );
}
