'use client';

import { Trans } from '@lingui/macro';

import QuestionIcon from '@/assets/question.svg';
import { NavigationBar } from '@/components/ActivityPage/common/NavigationBar.js';
import { CZActivityCheckList } from '@/components/ActivityPage/CZ/CZActivityCheckList.js';
import { Link } from '@/esm/Link.js';
import { useComeBack } from '@/hooks/useComeback.js';

export default function Page() {
    const comeback = useComeBack();
    return (
        <div className="mx-auto flex w-full max-w-[600px] flex-col">
            <NavigationBar
                className="z-20 bg-primaryBottom"
                onBack={comeback}
                right={
                    <Link href="/activity/cz/rules">
                        <QuestionIcon width={24} height={24} />
                    </Link>
                }
            >
                <Trans>CZ-Welcome Back Airdrop</Trans>
            </NavigationBar>
            <CZActivityCheckList />
        </div>
    );
}
