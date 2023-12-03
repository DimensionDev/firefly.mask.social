import { Trans } from '@lingui/macro';

export default function EmptyProfile() {
    return (
        <div className=" mt-40 px-5 text-center text-2xl font-bold">
            <Trans>{"This Account doesn't exist"} </Trans>
        </div>
    );
}
