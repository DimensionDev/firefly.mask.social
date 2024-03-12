import { memo } from 'react';

import FireflyIcon from '@/assets/firefly.svg';
import MagnifierIcon from '@/assets/magnifier.svg';
import MenuIcon from '@/assets/menu.svg';

export const NavigatorBarForMobile = memo(function NavigatorBarForMobile() {
    return (
        <header className=" flex items-center px-4 py-[7px] text-main">
            <button className=" flex h-[30px] w-[30x] items-center justify-center">
                <MenuIcon />
            </button>
            <h1 className=" flex flex-1 justify-center">
                <FireflyIcon />
            </h1>
            <button className=" flex h-[30px] w-[30x] items-center justify-center">
                <MagnifierIcon />
            </button>
        </header>
    );
});
