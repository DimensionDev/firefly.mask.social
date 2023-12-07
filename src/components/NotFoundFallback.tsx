import { t } from '@lingui/macro';

export default function NotFoundFallback({ type = 'post' }: { type?: 'post' | 'profile' }) {
    return (
        <div className=" mt-40 px-5 text-center text-2xl font-bold">
            {type === 'post' ? t`This post doesn't exist` : t`This profile doesn't exist`}
        </div>
    );
}
