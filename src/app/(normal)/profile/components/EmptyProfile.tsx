import { t } from '@lingui/macro';

export default function EmptyProfile() {
    return <div className=" mt-40 px-5 text-center text-2xl font-bold">{t`This profile doesn't exist`}</div>;
}
