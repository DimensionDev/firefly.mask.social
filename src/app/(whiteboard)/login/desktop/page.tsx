import { Trans } from '@lingui/macro';

import FullLogo from '@/assets/fullLogo.svg';
import { Link } from '@/esm/Link.js';

export default function Page() {
    return <div className="absolute inset-0 bg-white pt-20 flex flex-col items-center dark:bg-black md:pt-[124px] gap-[178px]">
        <FullLogo width={240} height={240} className='text-black dark:text-white' />
        <div className='w-full px-9 md:px-0 md:max-w-[311px]'>
            <Link
                className="block bg-black w-full rounded-xl px-5 py-2 text-center text-xl font-bold text-white dark:bg-white dark:text-[#181A20]"
                href="https://5euxu.app.link/PHvNiyVemIb"
            >
                <Trans>Open in Firefly App</Trans>
            </Link>
        </div>
    </div>
}
